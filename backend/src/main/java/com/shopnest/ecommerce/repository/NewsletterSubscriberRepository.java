package com.shopnest.ecommerce.repository;

import com.shopnest.ecommerce.entity.NewsletterSubscriber;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NewsletterSubscriberRepository extends JpaRepository<NewsletterSubscriber, Long> {
    boolean existsByEmailIgnoreCase(String email);
    List<NewsletterSubscriber> findAllByOrderByIdDesc();
}
