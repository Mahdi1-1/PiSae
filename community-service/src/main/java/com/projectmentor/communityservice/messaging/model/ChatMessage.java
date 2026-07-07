package com.projectmentor.communityservice.messaging.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "chat_messages")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessage {

    @Id
    private String id;

    private String senderId;

    private String receiverId;      // pour messages privés

    private String groupId;         // pour messages de groupe (optionnel)

    private String content;

    private MessageType type;       // CHAT / JOIN / LEAVE / PRIVATE

    private boolean read;

    private LocalDateTime sentAt;
}