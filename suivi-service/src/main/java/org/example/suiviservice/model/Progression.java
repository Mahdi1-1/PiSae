package org.example.suiviservice.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.example.suiviservice.Enum.StatutProgression;

import java.time.LocalDateTime;

// Contrainte unique sur (apprenant_id, formation_id, chapitre_id) : empêche les doublons
// au niveau chapitre. En SQL, NULL != NULL, donc cette contrainte ne bloque pas plusieurs
// lignes "niveau formation" (chapitre_id = null) pour le même couple apprenant/formation —
// c'est la couche service (findOrCreate) qui garantit l'unicité dans ce cas précis.
@Entity
@Table(
        name = "progression",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_progression_apprenant_formation_chapitre",
                columnNames = {"apprenant_id", "formation_id", "chapitre_id"}
        )
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Progression {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "L'identifiant de l'apprenant est obligatoire")
    @Column(name = "apprenant_id", nullable = false)
    private Long apprenantId;

    @NotNull(message = "L'identifiant de la formation est obligatoire")
    @Column(name = "formation_id", nullable = false)
    private Long formationId;

    // Nullable : une progression au niveau formation (pas de chapitre précis) a chapitreId = null
    @Column(name = "chapitre_id")
    private Long chapitreId;

    @NotNull(message = "Le pourcentage est obligatoire")
    @Min(value = 0, message = "Le pourcentage ne peut pas être négatif")
    @Max(value = 100, message = "Le pourcentage ne peut pas dépasser 100")
    @Column(nullable = false)
    private Integer pourcentage;

    @NotNull
    @Column(name = "date_debut", nullable = false)
    private LocalDateTime dateDebut;

    @NotNull
    @Column(name = "date_derniere_maj", nullable = false)
    private LocalDateTime dateDerniereMaj;

    @NotNull(message = "Le statut est obligatoire")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutProgression statut;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (dateDebut == null) {
            dateDebut = now;
        }
        dateDerniereMaj = now;
        if (statut == null) {
            statut = StatutProgression.NON_COMMENCE;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        dateDerniereMaj = LocalDateTime.now();
    }
}
