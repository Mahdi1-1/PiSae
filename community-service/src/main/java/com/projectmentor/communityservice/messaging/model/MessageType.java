package com.projectmentor.communityservice.messaging.model;

public enum MessageType {
    CHAT,       // message normal dans un groupe
    PRIVATE,    // message privé entre deux membres
    INVITATION, // invitation de message (non connecté)
    JOIN,       // notification d'entrée dans un groupe
    LEAVE       // notification de sortie
}