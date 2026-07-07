package com.projectmentor.communityservice.network.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "member_connections")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MemberConnection {

    @Id
    private String id;

    private String requesterId;     // celui qui envoie la demande

    private String targetId;        // celui qui reçoit

    private ConnectionStatus status;

    private String message;         // message personnalisé optionnel

    private boolean aiSuggested;    // suggéré par IA3 ou manuel

    private double matchScore;      // score IA si suggéré

    private LocalDateTime createdAt;

    private LocalDateTime respondedAt;
}