package com.projectmentor.communityservice.messaging.service;

import com.projectmentor.communityservice.messaging.model.ChatMessage;
import com.projectmentor.communityservice.messaging.model.MessageType;
import com.projectmentor.communityservice.messaging.repository.ChatMessageRepository;
import com.projectmentor.communityservice.network.service.ConnectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatMessageRepository repository;
    private final ConnectionService connectionService;

    // sauvegarder un message de groupe
    public ChatMessage saveGroupMessage(ChatMessage message) {
        message.setSentAt(LocalDateTime.now());
        message.setRead(false);
        message.setType(MessageType.CHAT);
        return repository.save(message);
    }

    // sauvegarder un message privé
    public ChatMessage savePrivateMessage(ChatMessage message) {
        message.setSentAt(LocalDateTime.now());
        message.setRead(false);
        
        // System messages are always private
        if ("SYSTEM".equals(message.getSenderId())) {
            message.setType(MessageType.PRIVATE);
        } else {
            // Check if members are connected
            boolean connected = connectionService.areConnected(message.getSenderId(), message.getReceiverId());
            message.setType(connected ? MessageType.PRIVATE : MessageType.INVITATION);
        }
        
        return repository.save(message);
    }
    
    // accepter une invitation de discussion
    public void acceptInvitation(String userId, String partnerId) {
        // Change all INVITATION messages between these users to PRIVATE
        List<ChatMessage> invitations = repository.findBySenderIdAndReceiverIdOrSenderIdAndReceiverIdOrderBySentAtAsc(
                userId, partnerId, partnerId, userId
        );
        
        invitations.stream()
                .filter(m -> m.getType() == MessageType.INVITATION)
                .forEach(m -> {
                    m.setType(MessageType.PRIVATE);
                    repository.save(m);
                });
    }

    // obtenir les invitations reçues
    public List<ChatMessage> getInvitations(String userId) {
        return repository.findByReceiverIdAndType(userId, MessageType.INVITATION);
    }

    // historique messages d'un groupe
    public List<ChatMessage> getGroupHistory(String groupId) {
        return repository.findByGroupIdOrderBySentAtAsc(groupId);
    }

    // historique conversation privée
    public List<ChatMessage> getPrivateHistory(String senderId, String receiverId) {
        return repository.findBySenderIdAndReceiverIdOrSenderIdAndReceiverIdOrderBySentAtAsc(
                senderId, receiverId, receiverId, senderId
        );
    }

    // messages non lus
    public List<ChatMessage> getUnreadMessages(String memberId) {
        return repository.findByReceiverIdAndReadFalse(memberId);
    }

    // marquer comme lu
    public void markAsRead(String messageId) {
        repository.findById(messageId).ifPresent(msg -> {
            msg.setRead(true);
            repository.save(msg);
        });
    }

    // marquer toute une conversation comme lue
    public void markConversationAsRead(String receiverId, String senderId) {
        List<ChatMessage> unread = repository.findByReceiverIdAndReadFalse(receiverId);
        unread.stream()
                .filter(m -> String.valueOf(m.getSenderId()).equals(senderId))
                .forEach(m -> {
                    m.setRead(true);
                    repository.save(m);
                });
    }

    // supprimer conversation privée
    public void deletePrivateConversation(String senderId, String receiverId) {
        List<ChatMessage> messages = getPrivateHistory(senderId, receiverId);
        repository.deleteAll(messages);
    }

    // Obtenir la liste des conversations récentes (un de chaque partenaire)
    public List<ChatMessage> getRecentConversations(String userId) {
        List<ChatMessage> allMessages = repository.findBySenderIdOrReceiverIdOrderBySentAtDesc(userId, userId);
        
        // On ne garde que les messages privés ou invitations (pas de groupe ici, c'est géré ailleurs)
        List<ChatMessage> privateMessages = allMessages.stream()
                .filter(m -> m.getGroupId() == null || m.getGroupId().isEmpty())
                .filter(m -> m.getType() == MessageType.PRIVATE || m.getType() == MessageType.INVITATION)
                .collect(Collectors.toList());

        Map<String, ChatMessage> latestByPartner = new LinkedHashMap<>();

        for (ChatMessage m : privateMessages) {
            String partnerId = m.getSenderId().equals(userId) ? m.getReceiverId() : m.getSenderId();
            if (partnerId != null && !latestByPartner.containsKey(partnerId)) {
                latestByPartner.put(partnerId, m);
            }
        }

        return new ArrayList<>(latestByPartner.values());
    }
}