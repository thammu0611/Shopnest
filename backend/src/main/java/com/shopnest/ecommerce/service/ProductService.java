package com.shopnest.ecommerce.service;

import com.shopnest.ecommerce.dto.ProductDtos.*;
import com.shopnest.ecommerce.entity.Category;
import com.shopnest.ecommerce.entity.Product;
import com.shopnest.ecommerce.exception.ApiExceptions.DuplicateResourceException;
import com.shopnest.ecommerce.exception.ApiExceptions.ResourceNotFoundException;
import com.shopnest.ecommerce.repository.CategoryRepository;
import com.shopnest.ecommerce.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final RatingLookup ratingLookup;

    @Transactional(readOnly = true)
    public Page<ProductResponse> list(String search, Long categoryId, int page, int size, String sort) {
        Sort sorting = switch (sort == null ? "" : sort) {
            case "price_asc"  -> Sort.by("price").ascending();
            case "price_desc" -> Sort.by("price").descending();
            case "name"       -> Sort.by("name").ascending();
            default            -> Sort.by("id").descending();
        };

        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 60), sorting);
        String term = StringUtils.hasText(search) ? search.trim() : null;

        Page<Product> found = productRepository.search(term, categoryId, pageable);
        var ratings = ratingLookup.forProducts(found.map(Product::getId).getContent());
        return found.map(p -> toResponse(p, RatingLookup.orNone(ratings, p.getId())));
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> listAllForAdmin() {
        List<Product> all = productRepository.findAllForAdmin();
        var ratings = ratingLookup.forProducts(all.stream().map(Product::getId).toList());
        return all.stream().map(p -> toResponse(p, RatingLookup.orNone(ratings, p.getId()))).toList();
    }

    @Transactional(readOnly = true)
    public ProductResponse get(Long id) {
        return toResponse(findProduct(id), ratingLookup.forProduct(id));
    }

    @Transactional
    public ProductResponse create(ProductRequest request) {
        Product product = Product.builder()
                .name(request.name().trim())
                .description(request.description())
                .price(request.price())
                .imageUrl(request.imageUrl())
                .stock(request.stock())
                .active(request.active() == null || request.active())
                .category(resolveCategory(request.categoryId()))
                .build();

        return toResponse(productRepository.save(product));
    }

    @Transactional
    public ProductResponse update(Long id, ProductRequest request) {
        Product product = findProduct(id);
        product.setName(request.name().trim());
        product.setDescription(request.description());
        product.setPrice(request.price());
        product.setImageUrl(request.imageUrl());
        product.setStock(request.stock());
        product.setActive(request.active() == null || request.active());
        product.setCategory(resolveCategory(request.categoryId()));
        return toResponse(productRepository.save(product));
    }

    /** Soft delete keeps order history intact. */
    @Transactional
    public void delete(Long id) {
        Product product = findProduct(id);
        product.setActive(false);
        productRepository.save(product);
    }

    // ---------- categories ----------

    @Transactional(readOnly = true)
    public List<CategoryResponse> categories() {
        return categoryRepository.findAll(Sort.by("name")).stream()
                .map(c -> new CategoryResponse(c.getId(), c.getName(), c.getDescription()))
                .toList();
    }

    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        if (categoryRepository.existsByNameIgnoreCase(request.name().trim())) {
            throw new DuplicateResourceException("Category '" + request.name() + "' already exists");
        }
        Category saved = categoryRepository.save(Category.builder()
                .name(request.name().trim())
                .description(request.description())
                .build());
        return new CategoryResponse(saved.getId(), saved.getName(), saved.getDescription());
    }

    // ---------- helpers ----------

    private Product findProduct(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product " + id + " not found"));
    }

    private Category resolveCategory(Long categoryId) {
        if (categoryId == null) return null;
        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category " + categoryId + " not found"));
    }

    /** Used where ratings are not needed (create/update responses). */
    public static ProductResponse toResponse(Product p) {
        return toResponse(p, new RatingLookup.Rating(null, 0L));
    }

    public static ProductResponse toResponse(Product p, RatingLookup.Rating rating) {
        return new ProductResponse(
                p.getId(), p.getName(), p.getDescription(), p.getPrice(), p.getImageUrl(),
                p.getStock(), p.getActive(),
                p.getCategory() != null ? p.getCategory().getId() : null,
                p.getCategory() != null ? p.getCategory().getName() : null,
                rating.average(), rating.count());
    }
}
