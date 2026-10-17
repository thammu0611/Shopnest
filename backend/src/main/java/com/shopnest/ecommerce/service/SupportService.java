package com.shopnest.ecommerce.service;

import com.shopnest.ecommerce.dto.SupportDtos.*;
import com.shopnest.ecommerce.entity.ContactMessage;
import com.shopnest.ecommerce.entity.NewsletterSubscriber;
import com.shopnest.ecommerce.entity.User;
import com.shopnest.ecommerce.exception.ApiExceptions.ResourceNotFoundException;
import com.shopnest.ecommerce.repository.ContactMessageRepository;
import com.shopnest.ecommerce.repository.NewsletterSubscriberRepository;
import com.shopnest.ecommerce.repository.OrderRepository;
import com.shopnest.ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/** Newsletter sign-ups, the contact inbox and the admin customer list. */
@Service
@RequiredArgsConstructor
@Slf4j
public class SupportService {

    private final NewsletterSubscriberRepository subscriberRepository;
    private final ContactMessageRepository messageRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;

    /** Idempotent: subscribing twice is not an error, it just says so. */
    @Transactional
    public MessageResponse subscribe(SubscribeRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        if (subscriberRepository.existsByEmailIgnoreCase(email)) {
            return new MessageResponse("You are already on the list - thank you!");
        }
        subscriberRepository.save(NewsletterSubscriber.builder().email(email).build());
        return new MessageResponse("Thank you for subscribing.");
    }

    @Transactional
    public MessageResponse contact(ContactRequest request) {
        ContactMessage saved = messageRepository.save(ContactMessage.builder()
                .name(request.name().trim())
                .email(request.email().trim())
                .subject(request.subject().trim())
                .message(request.message().trim())
                .orderNumber(request.orderNumber() == null || request.orderNumber().isBlank()
                        ? null : request.orderNumber().trim())
                .build());
        log.info("Contact message #{} received from {}", saved.getId(), saved.getEmail());
        return new MessageResponse("Thanks, " + saved.getName() + ". We will reply within one business day.");
    }

    // ---------- admin ----------

    @Transactional(readOnly = true)
    public List<ContactMessageResponse> messages() {
        return messageRepository.findAllByOrderByResolvedAscIdDesc().stream()
                .map(SupportService::toResponse).toList();
    }

    @Transactional
    public ContactMessageResponse setResolved(Long id, boolean resolved) {
        ContactMessage message = messageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found"));
        message.setResolved(resolved);
        return toResponse(messageRepository.save(message));
    }

    @Transactional(readOnly = true)
    public List<SubscriberResponse> subscribers() {
        return subscriberRepository.findAllByOrderByIdDesc().stream()
                .map(s -> new SubscriberResponse(s.getId(), s.getEmail(), s.getCreatedAt()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CustomerResponse> customers() {
        Map<Long, Object[]> stats = new HashMap<>();
        for (Object[] row : orderRepository.statsByUser()) {
            stats.put(((Number) row[0]).longValue(), row);
        }
        return userRepository.findAll(Sort.by(Sort.Direction.DESC, "id")).stream()
                .map(u -> toResponse(u, stats.get(u.getId())))
                .toList();
    }

    private static CustomerResponse toResponse(User u, Object[] stats) {
        long orders = stats == null ? 0 : ((Number) stats[1]).longValue();
        BigDecimal spent = stats == null || stats[2] == null ? BigDecimal.ZERO
                : (stats[2] instanceof BigDecimal bd ? bd : BigDecimal.valueOf(((Number) stats[2]).doubleValue()));
        return new CustomerResponse(u.getId(), u.getName(), u.getEmail(), u.getPhone(),
                u.getRole().name(), u.getCreatedAt(), orders, spent);
    }

    private static ContactMessageResponse toResponse(ContactMessage m) {
        return new ContactMessageResponse(m.getId(), m.getName(), m.getEmail(), m.getSubject(),
                m.getMessage(), m.getOrderNumber(), Boolean.TRUE.equals(m.getResolved()), m.getCreatedAt());
    }
}
