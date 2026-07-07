package com.projectmentor.communityservice.notification.service;

import com.projectmentor.communityservice.notification.model.Notification;
import com.projectmentor.communityservice.notification.model.NotificationType;
import com.projectmentor.communityservice.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository repository;
    private final SimpMessagingTemplate messagingTemplate;

    public Notification createAndSend(String userId, NotificationType type, String message, Map<String, String> metadata) {
        Notification notification = Notification.builder()
                .userId(userId)
                .type(type)
                .message(message)
                .metadata(metadata)
                .read(false)
                .createdAt(LocalDateTime.now())
                .build();

        Notification saved = repository.save(notification);

        // Push real-time via WebSocket
        try {
            messagingTemplate.convertAndSend("/topic/notifications/" + userId, saved);
            log.info("Notification pushed to user {}: {}", userId, type);
        } catch (Exception e) {
            log.error("Failed to push notification via WebSocket: {}", e.getMessage());
        }

        return saved;
    }

    public List<Notification> getNotifications(String userId) {
        return repository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public void markAsRead(String id) {
        repository.findById(id).ifPresent(n -> {
            n.setRead(true);
            repository.save(n);
        });
    }

    public void markAllAsRead(String userId) {
        List<Notification> unread = repository.findByUserIdOrderByCreatedAtDesc(userId);
        unread.stream().filter(n -> !n.isRead()).forEach(n -> {
            n.setRead(true);
            repository.save(n);
        });
    }

    public long getUnreadCount(String userId) {
        return repository.countByUserIdAndReadFalse(userId);
    }
}
