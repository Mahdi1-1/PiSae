package org.example.suiviservice.repository;

import org.example.suiviservice.model.Progression;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProgressionRepository extends JpaRepository<Progression, Long> {

    // Lookup exact utilisé pour le "find or create" côté service (upsert de progression)
    Optional<Progression> findByApprenantIdAndFormationIdAndChapitreId(Long apprenantId, Long formationId, Long chapitreId);

    // Toutes les lignes de progression d'un apprenant, utilisé par l'endpoint de résumé
    List<Progression> findByApprenantId(Long apprenantId);

    // Liste paginée pour une formation donnée
    Page<Progression> findByFormationId(Long formationId, Pageable pageable);

    // Détection d'inactivité : un apprenant est inactif si SA DERNIÈRE mise à jour de
    // progression (toutes formations confondues) est antérieure à la date donnée — pas si
    // une seule de ses lignes est ancienne alors qu'il a progressé ailleurs plus récemment.
    @Query("""
            SELECT p.apprenantId
            FROM Progression p
            GROUP BY p.apprenantId
            HAVING MAX(p.dateDerniereMaj) < :cutoff
            """)
    List<Long> findApprenantIdsInactifsDepuis(@Param("cutoff") LocalDateTime cutoff);

    // Utilisé pour enrichir la réponse d'inactivité avec la date de dernière activité réelle
    // (le service extrait getDateDerniereMaj() — une projection directe sur LocalDateTime
    // n'est pas possible via un simple nom de méthode dérivée)
    Optional<Progression> findTopByApprenantIdOrderByDateDerniereMajDesc(Long apprenantId);
}
