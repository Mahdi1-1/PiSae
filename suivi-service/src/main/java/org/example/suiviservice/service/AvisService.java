package org.example.suiviservice.service;

import org.example.suiviservice.Enum.StatutAvis;
import org.example.suiviservice.dto.AvisRequest;
import org.example.suiviservice.dto.AvisResponse;
import org.example.suiviservice.dto.AvisStatsResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AvisService {

    // Lève AvisDejaExistantException si l'apprenant a déjà un avis sur cette formation
    AvisResponse create(AvisRequest request);

    AvisResponse getById(Long id);

    // Met à jour le contenu (note/commentaire) d'un avis existant, sans toucher à son statut
    AvisResponse updateContenu(Long id, AvisRequest request);

    // Change uniquement le statut (modération), sans toucher au contenu
    AvisResponse moderer(Long id, StatutAvis nouveauStatut);

    Page<AvisResponse> getByFormation(Long formationId, Pageable pageable);

    // Note moyenne, nombre d'avis et répartition des notes — uniquement sur les avis PUBLIE
    // (un avis SIGNALE/MASQUE ne doit pas peser sur les statistiques publiques d'une formation).
    AvisStatsResponse getStats(Long formationId);

    void delete(Long id);
}
