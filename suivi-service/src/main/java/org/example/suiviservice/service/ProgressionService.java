package org.example.suiviservice.service;

import org.example.suiviservice.dto.ProgressionRequest;
import org.example.suiviservice.dto.ProgressionResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ProgressionService {

    // Crée la progression si elle n'existe pas encore pour (apprenantId, formationId, chapitreId),
    // sinon met à jour le pourcentage existant (upsert) — voir Impl pour la justification.
    ProgressionResponse createOrUpdate(ProgressionRequest request);

    ProgressionResponse getById(Long id);

    // Mise à jour directe par id (le client connaît déjà l'id) : seuls pourcentage/chapitreId
    // sont modifiables, apprenantId/formationId doivent correspondre à l'existant.
    ProgressionResponse update(Long id, ProgressionRequest request);

    Page<ProgressionResponse> getByFormation(Long formationId, Pageable pageable);

    List<ProgressionResponse> getByApprenant(Long apprenantId);

    void delete(Long id);
}
