package org.example.suiviservice.repository;

import org.example.suiviservice.Enum.StatutAvis;
import org.example.suiviservice.model.Avis;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AvisRepository extends JpaRepository<Avis, Long> {

    // Liste paginée des avis d'une formation, plus récents d'abord
    Page<Avis> findByFormationIdOrderByDateCreationDesc(Long formationId, Pageable pageable);

    // Tous les avis publiés d'une formation, utilisé pour le calcul des statistiques
    List<Avis> findByFormationIdAndStatut(Long formationId, StatutAvis statut);

    // Vérifie/récupère l'avis existant d'un apprenant sur une formation (règle "un avis par formation")
    Optional<Avis> findByApprenantIdAndFormationId(Long apprenantId, Long formationId);
}
