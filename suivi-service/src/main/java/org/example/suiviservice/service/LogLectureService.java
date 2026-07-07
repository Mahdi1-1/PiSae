package org.example.suiviservice.service;

import org.example.suiviservice.dto.LogLectureRequest;
import org.example.suiviservice.dto.LogLectureResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;

public interface LogLectureService {

    LogLectureResponse create(LogLectureRequest request);

    LogLectureResponse getById(Long id);

    // Correction d'un log existant (ex: temps ré-évalué) : ressourceType/tempsPasseSecondes
    // uniquement, apprenantId/formationId/ressourceId doivent correspondre à l'existant.
    LogLectureResponse update(Long id, LogLectureRequest request);

    // dateDebut/dateFin optionnels : si absents, la recherche couvre "depuis toujours" / "jusqu'à maintenant"
    Page<LogLectureResponse> search(Long formationId, LocalDateTime dateDebut, LocalDateTime dateFin, Pageable pageable);

    Page<LogLectureResponse> getByApprenantAndFormation(Long apprenantId, Long formationId, Pageable pageable);

    List<LogLectureResponse> getByApprenant(Long apprenantId);

    void delete(Long id);
}
