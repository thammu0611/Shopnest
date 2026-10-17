package com.shopnest.ecommerce.service;

import com.shopnest.ecommerce.dto.AddressDtos.*;
import com.shopnest.ecommerce.entity.Address;
import com.shopnest.ecommerce.entity.User;
import com.shopnest.ecommerce.exception.ApiExceptions.BadRequestException;
import com.shopnest.ecommerce.exception.ApiExceptions.ResourceNotFoundException;
import com.shopnest.ecommerce.repository.AddressRepository;
import com.shopnest.ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/** The customer's address book. Exactly one address is the default once any exist. */
@Service
@RequiredArgsConstructor
public class AddressService {

    private static final int MAX_ADDRESSES = 10;

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<AddressResponse> list(String email) {
        return addressRepository.findByUserIdOrderByIsDefaultDescIdDesc(currentUser(email).getId())
                .stream().map(AddressService::toResponse).toList();
    }

    @Transactional
    public AddressResponse create(String email, AddressRequest request) {
        User user = currentUser(email);
        long existing = addressRepository.countByUserId(user.getId());
        if (existing >= MAX_ADDRESSES) {
            throw new BadRequestException("You can save up to " + MAX_ADDRESSES + " addresses");
        }
        Address address = Address.builder().user(user).build();
        copy(address, request);
        // the first address is always the default
        boolean makeDefault = existing == 0 || Boolean.TRUE.equals(request.makeDefault());
        if (makeDefault) clearDefault(user.getId());
        address.setIsDefault(makeDefault);
        return toResponse(addressRepository.save(address));
    }

    @Transactional
    public AddressResponse update(String email, Long id, AddressRequest request) {
        User user = currentUser(email);
        Address address = owned(user.getId(), id);
        copy(address, request);
        if (Boolean.TRUE.equals(request.makeDefault()) && !address.getIsDefault()) {
            clearDefault(user.getId());
            address.setIsDefault(true);
        }
        return toResponse(addressRepository.save(address));
    }

    @Transactional
    public AddressResponse makeDefault(String email, Long id) {
        User user = currentUser(email);
        Address address = owned(user.getId(), id);
        clearDefault(user.getId());
        address.setIsDefault(true);
        return toResponse(addressRepository.save(address));
    }

    @Transactional
    public void delete(String email, Long id) {
        User user = currentUser(email);
        Address address = owned(user.getId(), id);
        boolean wasDefault = address.getIsDefault();
        addressRepository.delete(address);
        addressRepository.flush();
        if (wasDefault) {
            // promote the most recent remaining address
            addressRepository.findByUserIdOrderByIsDefaultDescIdDesc(user.getId()).stream().findFirst()
                    .ifPresent(next -> {
                        next.setIsDefault(true);
                        addressRepository.save(next);
                    });
        }
    }

    // ---------- helpers ----------

    private void clearDefault(Long userId) {
        for (Address a : addressRepository.findByUserIdOrderByIsDefaultDescIdDesc(userId)) {
            if (Boolean.TRUE.equals(a.getIsDefault())) {
                a.setIsDefault(false);
                addressRepository.save(a);
            }
        }
    }

    private static void copy(Address address, AddressRequest r) {
        address.setLabel(r.label().trim());
        address.setFullName(r.fullName().trim());
        address.setPhone(r.phone().trim());
        address.setLine1(r.line1().trim());
        address.setLine2(r.line2() == null || r.line2().isBlank() ? null : r.line2().trim());
        address.setCity(r.city().trim());
        address.setState(r.state().trim());
        address.setPincode(r.pincode().trim());
    }

    private Address owned(Long userId, Long id) {
        return addressRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));
    }

    private User currentUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private static AddressResponse toResponse(Address a) {
        return new AddressResponse(a.getId(), a.getLabel(), a.getFullName(), a.getPhone(),
                a.getLine1(), a.getLine2(), a.getCity(), a.getState(), a.getPincode(),
                Boolean.TRUE.equals(a.getIsDefault()));
    }
}
