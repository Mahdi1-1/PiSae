package com.projectmentor.communityservice.notification.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.Map;

@Document(collection = "notifications")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notification {
    @Id
    private String id;
    private String userId;
    private NotificationType type;
    private String message;
    private Map<String, String> metadata;
    private boolean read;
    private LocalDateTime createdAt;
}
