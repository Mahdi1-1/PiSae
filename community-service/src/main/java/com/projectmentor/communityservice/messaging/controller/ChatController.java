package com.projectmentor.communityservice.messaging.controller;

import com.projectmentor.communityservice.messaging.model.ChatMessage;
import com.projectmentor.communityservice.messaging.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    // ── WebSocket handlers ──────────────────────────

    // message dans un groupe → broadcast à tous les membres du groupe
    @MessageMapping("/chat.group/{groupId}")
    @SendTo("/topic/group/{groupId}")
    public ChatMessage sendGroupMessage(@Payload ChatMessage message) {
        return chatService.saveGroupMessage(message);
    }

    // message privé → envoyé uniquement au destinataire
    @MessageMapping("/chat.private")
    public ChatMessage sendPrivateMessage(@Payload ChatMessage message) {
        ChatMessage saved = chatService.savePrivateMessage(message);
        // envoyer au destinataire via un topic spécifique au lieu de queue globale (car pas d'auth Principal)
        messagingTemplate.convertAndSend(
                "/topic/user/" + message.getReceiverId(),
                saved
        );
        return saved;
    }

    // notification join/leave groupe
    @MessageMapping("/chat.join/{groupId}")
    @SendTo("/topic/group/{groupId}")
    public ChatMessage joinGroup(@Payload ChatMessage message) {
        message.setContent(message.getSenderId() + " a rejoint le groupe");
        return chatService.saveGroupMessage(message);
    }

    // ── REST endpoints pour historique ─────────────

    @GetMapping("/api/community/messages/group/{groupId}")
    public List<ChatMessage> getGroupHistory(@PathVariable String groupId) {
        return chatService.getGroupHistory(groupId);
    }

    @GetMapping("/api/community/messages/private")
    public List<ChatMessage> getPrivateHistory(
            @RequestParam String senderId,
            @RequestParam String receiverId) {
        return chatService.getPrivateHistory(senderId, receiverId);
    }

    @GetMapping("/api/community/messages/unread/{memberId}")
    public List<ChatMessage> getUnreadMessages(@PathVariable String memberId) {
        return chatService.getUnreadMessages(memberId);
    }

    @GetMapping("/api/community/messages/conversations/{userId}")
    public List<ChatMessage> getRecentConversations(@PathVariable String userId) {
        return chatService.getRecentConversations(userId);
    }

    @GetMapping("/api/community/messages/invitations/{memberId}")
    public List<ChatMessage> getInvitations(@PathVariable String memberId) {
        return chatService.getInvitations(memberId);
    }

    @PostMapping("/api/community/messages/invitations/accept")
    public void acceptInvitation(@RequestParam String userId, @RequestParam String partnerId) {
        chatService.acceptInvitation(userId, partnerId);
    }

    @PutMapping("/api/community/messages/{messageId}/read")
    public void markAsRead(@PathVariable String messageId) {
        chatService.markAsRead(messageId);
    }

    @PutMapping("/api/community/messages/read/all")
    public void markConversationAsRead(
            @RequestParam String userId,
            @RequestParam String partnerId) {
        chatService.markConversationAsRead(userId, partnerId);
    }

    @DeleteMapping("/api/community/messages/private")
    public void deletePrivateConversation(
            @RequestParam String userId1,
            @RequestParam String userId2) {
        chatService.deletePrivateConversation(userId1, userId2);
    }
}