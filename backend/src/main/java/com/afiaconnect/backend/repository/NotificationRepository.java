package com.afiaconnect.backend.repository;

import com.afiaconnect.backend.entity.Notification;
import com.afiaconnect.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface NotificationRepository extends JpaRepository<Notification, UUID> {
    List<Notification> findByUserOrderByCreatedAtDesc(User user);
    Long countByUserAndIsReadFalse(User user);
}