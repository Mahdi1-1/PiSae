package com.projectmentor.communityservice.network.service;

import com.projectmentor.communityservice.network.model.ConnectionStatus;
import com.projectmentor.communityservice.network.model.MemberConnection;
import com.projectmentor.communityservice.network.repository.ConnectionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class ConnectionService {

    private final ConnectionRepository repository;
    private final com.projectmentor.communityservice.notification.service.NotificationService notificationService;
    private final UserService userService;

    // ── envoyer une demande de connexion ──

    public MemberConnection sendRequest(String requesterId, String targetId, String message) {

        // vérifier si demande déjà existante
        repository.findByRequesterIdAndTargetId(requesterId, targetId)
                .ifPresent(c -> { throw new RuntimeException("Connection request already exists"); });

        MemberConnection connection = MemberConnection.builder()
                .requesterId(requesterId)
                .targetId(targetId)
                .message(message)
                .status(ConnectionStatus.PENDING)
                .aiSuggested(false)
                .matchScore(0)
                .createdAt(LocalDateTime.now())
                .build();

        MemberConnection saved = repository.save(connection);

        // Notify target
        try {
            String name = userService.getUserName(Long.parseLong(requesterId));
            notificationService.createAndSend(
                    targetId,
                    com.projectmentor.communityservice.notification.model.NotificationType.CONNECTION_REQUEST,
                    name + " souhaite se connecter avec vous.",
                    java.util.Map.of("requesterId", requesterId, "connectionId", saved.getId())
            );
        } catch (Exception ignored) {}

        return saved;
    }

    // ── accepter une demande ──

    public MemberConnection acceptRequest(String connectionId) {
        MemberConnection connection = repository.findById(connectionId)
                .orElseThrow(() -> new RuntimeException("Connection not found"));

        connection.setStatus(ConnectionStatus.ACCEPTED);
        connection.setRespondedAt(LocalDateTime.now());
        MemberConnection saved = repository.save(connection);

        // Notify requester
        try {
            String name = userService.getUserName(Long.parseLong(connection.getTargetId()));
            notificationService.createAndSend(
                    connection.getRequesterId(),
                    com.projectmentor.communityservice.notification.model.NotificationType.CONNECTION_ACCEPTED,
                    name + " a accepté votre demande de connexion.",
                    java.util.Map.of("targetId", connection.getTargetId(), "connectionId", saved.getId())
            );
        } catch (Exception ignored) {}

        return saved;
    }

    // ── refuser une demande ──

    public MemberConnection declineRequest(String connectionId) {
        MemberConnection connection = repository.findById(connectionId)
                .orElseThrow(() -> new RuntimeException("Connection not found"));

        connection.setStatus(ConnectionStatus.DECLINED);
        connection.setRespondedAt(LocalDateTime.now());
        return repository.save(connection);
    }

    // ── bloquer un membre ──

    public MemberConnection blockMember(String connectionId) {
        MemberConnection connection = repository.findById(connectionId)
                .orElseThrow(() -> new RuntimeException("Connection not found"));

        connection.setStatus(ConnectionStatus.BLOCKED);
        connection.setRespondedAt(LocalDateTime.now());
        return repository.save(connection);
    }

    // ── mes connexions acceptées ──

    public List<MemberConnection> getMyConnections(String memberId) {
        List<MemberConnection> sent = repository
                .findByRequesterIdAndStatus(memberId, ConnectionStatus.ACCEPTED);
        List<MemberConnection> received = repository
                .findByTargetIdAndStatus(memberId, ConnectionStatus.ACCEPTED);

        return Stream.concat(sent.stream(), received.stream())
                .collect(Collectors.toList());
    }

    // ── demandes en attente reçues ──

    public List<MemberConnection> getPendingRequests(String memberId) {
        return repository.findByTargetIdAndStatus(memberId, ConnectionStatus.PENDING);
    }

    // ── demandes en attente envoyées ──

    public List<MemberConnection> getSentPendingRequests(String memberId) {
        return repository.findByRequesterIdAndStatus(memberId, ConnectionStatus.PENDING);
    }

    // ── toutes mes interactions (envoyées + reçues) ──

    public List<MemberConnection> getAllConnections(String memberId) {
        return repository.findByRequesterIdOrTargetId(memberId, memberId);
    }

    // ── vérifier si deux membres sont connectés ──

    public boolean areConnected(String memberId1, String memberId2) {
        return repository.findByRequesterIdAndTargetId(memberId1, memberId2)
                .map(c -> c.getStatus() == ConnectionStatus.ACCEPTED)
                .orElseGet(() ->
                        repository.findByRequesterIdAndTargetId(memberId2, memberId1)
                                .map(c -> c.getStatus() == ConnectionStatus.ACCEPTED)
                                .orElse(false)
                );
    }
}