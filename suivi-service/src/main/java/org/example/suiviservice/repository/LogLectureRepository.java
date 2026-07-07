package org.example.suiviservice.repository;

import org.example.suiviservice.model.LogLecture;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface LogLectureRepository extends JpaRepository<LogLecture, Long> {

    // Filtrage par formation + plage de dates (GET /api/logs?formationId=X&dateDebut=...&dateFin=...)
    Page<LogLecture> findByFormationIdAndDateConsultationBetween(
            Long formationId, LocalDateTime dateDebut, LocalDateTime dateFin, Pageable pageable);

    // Liste paginée des logs d'un apprenant pour une formation
    Page<LogLecture> findByApprenantIdAndFormationId(Long apprenantId, Long formationId, Pageable pageable);

    // Tous les logs d'un apprenant, utilisé pour cumuler le temps total passé (résumé)
    List<LogLecture> findByApprenantId(Long apprenantId);
}
