package com.projectmentor.communityservice.network.controller;

import com.projectmentor.communityservice.network.dto.UserDiscoveryResponse;
import com.projectmentor.communityservice.network.model.MemberConnection;
import com.projectmentor.communityservice.network.service.ConnectionService;
import com.projectmentor.communityservice.network.service.UserDiscoveryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/community/connections")
@RequiredArgsConstructor
public class ConnectionController {

    private final ConnectionService connectionService;
    private final UserDiscoveryService userDiscoveryService;

    // envoyer une demande
    @PostMapping("/request")
    public MemberConnection sendRequest(
            @RequestParam String requesterId,
            @RequestParam String targetId,
            @RequestParam(required = false) String message) {
        return connectionService.sendRequest(requesterId, targetId, message);
    }

    // accepter
    @PutMapping("/{connectionId}/accept")
    public MemberConnection acceptRequest(@PathVariable String connectionId) {
        return connectionService.acceptRequest(connectionId);
    }

    // refuser
    @PutMapping("/{connectionId}/decline")
    public MemberConnection declineRequest(@PathVariable String connectionId) {
        return connectionService.declineRequest(connectionId);
    }

    // bloquer
    @PutMapping("/{connectionId}/block")
    public MemberConnection blockMember(@PathVariable String connectionId) {
        return connectionService.blockMember(connectionId);
    }

    // mes connexions acceptées
    @GetMapping("/{memberId}")
    public List<MemberConnection> getMyConnections(@PathVariable String memberId) {
        return connectionService.getMyConnections(memberId);
    }

    // demandes en attente reçues
    @GetMapping("/{memberId}/pending")
    public List<MemberConnection> getPendingRequests(@PathVariable String memberId) {
        return connectionService.getPendingRequests(memberId);
    }

    // demandes en attente envoyées
    @GetMapping("/{memberId}/pending/sent")
    public List<MemberConnection> getSentPendingRequests(@PathVariable String memberId) {
        return connectionService.getSentPendingRequests(memberId);
    }

    // toutes les interactions (envoyées + reçues)
    @GetMapping("/{memberId}/all")
    public List<MemberConnection> getAllConnections(@PathVariable String memberId) {
        return connectionService.getAllConnections(memberId);
    }

    // vérifier si deux membres sont connectés
    @GetMapping("/check")
    public boolean areConnected(
            @RequestParam String memberId1,
            @RequestParam String memberId2) {
        return connectionService.areConnected(memberId1, memberId2);
    }

    // ── User Discovery ───────────────────────────────

    @GetMapping("/discover")
    public List<UserDiscoveryResponse> discoverUsers(
            @RequestParam String query,
            @RequestParam String currentUserId) {
        return userDiscoveryService.discoverUsers(query, currentUserId);
    }

    @GetMapping("/recommended/{userId}")
    public List<UserDiscoveryResponse> getRecommendedUsers(@PathVariable String userId) {
        return userDiscoveryService.getRecommendedUsers(userId);
    }
}