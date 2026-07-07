package com.projectmentor.communityservice.network.repository;

import com.projectmentor.communityservice.network.model.ConnectionStatus;
import com.projectmentor.communityservice.network.model.MemberConnection;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface ConnectionRepository extends MongoRepository<MemberConnection, String> {

    // toutes les connexions d'un membre (envoyées + reçues)
    List<MemberConnection> findByRequesterIdOrTargetId(String requesterId, String targetId);

    // connexions acceptées uniquement
    List<MemberConnection> findByRequesterIdAndStatus(String requesterId, ConnectionStatus status);

    // connexions reçues par statut (acceptées OU en attente)
    List<MemberConnection> findByTargetIdAndStatus(String targetId, ConnectionStatus status);

    // vérifier si connexion existe déjà
    Optional<MemberConnection> findByRequesterIdAndTargetId(String requesterId, String targetId);

    // vérifier si connexion existe déjà avec statut spécifique
    Optional<MemberConnection> findByRequesterIdAndTargetIdAndStatus(String requesterId, String targetId, ConnectionStatus status);
}