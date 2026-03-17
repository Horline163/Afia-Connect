package com.afiaconnect.backend.service;

import com.afiaconnect.backend.entity.Notification;

import java.util.List;
import java.util.UUID;

public interface NotificationService {
    List<Notification> getMyNotifications(String userEmail);
    Notification markAsRead(UUID id);
    Long getUnreadCount(String userEmail);
}
