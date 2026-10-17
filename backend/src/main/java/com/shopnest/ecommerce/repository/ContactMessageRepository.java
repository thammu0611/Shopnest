package com.shopnest.ecommerce.repository;

import com.shopnest.ecommerce.entity.ContactMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ContactMessageRepository extends JpaRepository<ContactMessage, Long> {
    List<ContactMessage> findAllByOrderByResolvedAscIdDesc();
    long countByResolvedFalse();
}
