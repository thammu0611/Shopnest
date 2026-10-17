package com.shopnest.ecommerce.service;

import com.shopnest.ecommerce.dto.ProductDtos.*;
import com.shopnest.ecommerce.entity.Category;
import com.shopnest.ecommerce.entity.Product;
import com.shopnest.ecommerce.exception.ApiExceptions.BadRequestException;
import com.shopnest.ecommerce.exception.ApiExceptions.DuplicateResourceException;
import com.shopnest.ecommerce.exception.ApiExceptions.ResourceNotFoundException;
import com.shopnest.ecommerce.repository.CategoryRepository;
import com.shopnest.ecommerce.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final RatingLookup ratingLookup;

    @Transactional(readOnly = true)
    public Page<ProductResponse> list(ProductFilter filter, int page, int size, String sort) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 60), sorting(sort));

        Page<Product> found = productRepository.search(
                blankToNull(filter.search()), filter.categoryId(), blankToNull(filter.brand()),
                filter.minPrice(), filter.maxPrice(), filter.minRating(),
                filter.inStock(), filter.onSale(), filter.featured(), pageable);

        var ratings = ratingLookup.forProducts(found.map(Product::getId).getContent());
        return found.map(p -> toResponse(p, RatingLookup.orNone(ratings, p.getId()), false));
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> listAllForAdmin() {
        List<Product> all = productRepository.findAllForAdmin();
        var ratings = ratingLookup.forProducts(all.stream().map(Product::getId).toList());
        return all.stream().map(p -> toResponse(p, RatingLookup.orNone(ratings, p.getId()), true)).toList();
    }

    @Transactional(readOnly = true)
    public ProductResponse get(Long id) {
        return toResponse(findProduct(id), ratingLookup.forProduct(id), true);
    }

    /**
     * "You may also like": best sellers from the same category first, topped up
     * from the rest of the catalogue when the category is small.
     */
    @Transactional(readOnly = true)
    public List<ProductResponse> related(Long id, int limit) {
        Product product = findProduct(id);
        int max = Math.min(Math.max(limit, 1), 12);
        Pageable page = PageRequest.of(0, max, sorting("popular"));

        List<Product> picks = new ArrayList<>();
        if (product.getCategory() != null) {
            picks.addAll(productRepository.findOthers(id, product.getCategory().getId(), page));
        }
        if (picks.size() < max) {
            for (Product other : productRepository.findOthers(id, null, PageRequest.of(0, max * 2, sorting("popular")))) {
                if (picks.size() >= max) break;
                if (picks.stream().noneMatch(p -> p.getId().equals(other.getId()))) picks.add(other);
            }
        }

        var ratings = ratingLookup.forProducts(picks.stream().map(Product::getId).toList());
        return picks.stream().map(p -> toResponse(p, RatingLookup.orNone(ratings, p.getId()), false)).toList();
    }

    @Transactional(readOnly = true)
    public CatalogFacets facets() {
        List<Object[]> bounds = productRepository.priceBounds();
        Object[] row = bounds.isEmpty() ? new Object[]{null, null} : bounds.get(0);
        return new CatalogFacets((BigDecimal) row[0], (BigDecimal) row[1], productRepository.distinctBrands());
    }

    @Transactional
    public ProductResponse create(ProductRequest request) {
        validatePricing(request);
        Product product = Product.builder()
                .name(request.name().trim())
                .description(request.description())
                .price(request.price())
                .mrp(request.mrp())
                .brand(blankToNull(request.brand()))
                .imageUrl(request.imageUrl())
                .images(cleanImages(request.images()))
                .stock(request.stock())
                .active(request.active() == null || request.active())
                .featured(Boolean.TRUE.equals(request.featured()))
                .category(resolveCategory(request.categoryId()))
                .build();

        return toResponse(productRepository.save(product));
    }

    @Transactional
    public ProductResponse update(Long id, ProductRequest request) {
        validatePricing(request);
        Product product = findProduct(id);
        product.setName(request.name().trim());
        product.setDescription(request.description());
        product.setPrice(request.price());
        product.setMrp(request.mrp());
        product.setBrand(blankToNull(request.brand()));
        product.setImageUrl(request.imageUrl());
        product.getImages().clear();
        product.getImages().addAll(cleanImages(request.images()));
        product.setStock(request.stock());
        product.setActive(request.active() == null || request.active());
        product.setFeatured(Boolean.TRUE.equals(request.featured()));
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
                .map(c -> toResponse(c, productRepository.countByCategoryIdAndActiveTrue(c.getId())))
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
                .imageUrl(blankToNull(request.imageUrl()))
                .build());
        return toResponse(saved, 0);
    }

    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category " + id + " not found"));
        String name = request.name().trim();
        categoryRepository.findByNameIgnoreCase(name)
                .filter(other -> !other.getId().equals(id))
                .ifPresent(other -> {
                    throw new DuplicateResourceException("Category '" + name + "' already exists");
                });
        category.setName(name);
        category.setDescription(request.description());
        category.setImageUrl(blankToNull(request.imageUrl()));
        return toResponse(categoryRepository.save(category),
                productRepository.countByCategoryIdAndActiveTrue(id));
    }

    /** Only empty categories can go - products (even archived ones) keep their category. */
    @Transactional
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category " + id + " not found"));
        long products = productRepository.countByCategoryId(id);
        if (products > 0) {
            throw new BadRequestException("'" + category.getName() + "' still has " + products
                    + " product(s). Move them to another category first.");
        }
        categoryRepository.delete(category);
    }

    // ---------- helpers ----------

    private static Sort sorting(String sort) {
        return switch (sort == null ? "" : sort) {
            case "price_asc"  -> Sort.by("price").ascending();
            case "price_desc" -> Sort.by("price").descending();
            case "name"       -> Sort.by("name").ascending();
            case "popular"    -> Sort.by(Sort.Order.desc("soldCount"), Sort.Order.desc("id"));
            default            -> Sort.by("id").descending();
        };
    }

    private static void validatePricing(ProductRequest request) {
        if (request.mrp() != null && request.mrp().compareTo(request.price()) < 0) {
            throw new BadRequestException("MRP cannot be lower than the selling price");
        }
    }

    private static List<String> cleanImages(List<String> images) {
        if (images == null) return new ArrayList<>();
        return new ArrayList<>(images.stream()
                .filter(StringUtils::hasText)
                .map(String::trim)
                .distinct()
                .toList());
    }

    private static String blankToNull(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
    }

    private Product findProduct(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product " + id + " not found"));
    }

    private Category resolveCategory(Long categoryId) {
        if (categoryId == null) return null;
        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category " + categoryId + " not found"));
    }

    private static CategoryResponse toResponse(Category c, long productCount) {
        return new CategoryResponse(c.getId(), c.getName(), c.getDescription(), c.getImageUrl(), productCount);
    }

    /** Whole-number percentage saved against the MRP, or null when not on sale. */
    public static Integer discountPercent(BigDecimal price, BigDecimal mrp) {
        if (price == null || mrp == null || mrp.compareTo(price) <= 0) return null;
        return mrp.subtract(price).multiply(BigDecimal.valueOf(100))
                .divide(mrp, 0, RoundingMode.HALF_UP).intValue();
    }

    /** Used where ratings are not needed (create/update responses). */
    public static ProductResponse toResponse(Product p) {
        return toResponse(p, new RatingLookup.Rating(null, 0L), true);
    }

    public static ProductResponse toResponse(Product p, RatingLookup.Rating rating, boolean withGallery) {
        return new ProductResponse(
                p.getId(), p.getName(), p.getDescription(), p.getPrice(),
                p.getMrp(), discountPercent(p.getPrice(), p.getMrp()), p.getBrand(),
                p.getImageUrl(), withGallery ? List.copyOf(p.getImages()) : List.of(),
                p.getStock(), p.getActive(), Boolean.TRUE.equals(p.getFeatured()),
                p.getSoldCount() == null ? 0 : p.getSoldCount(),
                p.getCategory() != null ? p.getCategory().getId() : null,
                p.getCategory() != null ? p.getCategory().getName() : null,
                rating.average(), rating.count(), p.getCreatedAt());
    }
}
