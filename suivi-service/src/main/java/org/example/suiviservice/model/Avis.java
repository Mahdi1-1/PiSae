package org.example.suiviservice.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.example.suiviservice.Enum.StatutAvis;

import java.time.LocalDateTime;

// Un apprenant ne peut poster qu'un seul avis par formation (règle métier confirmée) :
// contrainte unique sur (apprenant_id, formation_id). Il peut ensuite modifier son avis via PUT.
@Entity
@Table(
        name = "avis",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_avis_apprenant_formation",
                columnNames = {"apprenant_id", "formation_id"}
        )
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Avis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "L'identifiant de l'apprenant est obligatoire")
    @Column(name = "apprenant_id", nullable = false)
    private Long apprenantId;

    @NotNull(message = "L'identifiant de la formation est obligatoire")
    @Column(name = "formation_id", nullable = false)
    private Long formationId;

    @NotNull(message = "La note est obligatoire")
    @Min(value = 1, message = "La note minimale est 1")
    @Max(value = 5, message = "La note maximale est 5")
    @Column(nullable = false)
    private Integer note;

    @Column(columnDefinition = "TEXT")
    private String commentaire;

    @NotNull
    @Column(name = "date_creation", nullable = false)
    private LocalDateTime dateCreation;

    @NotNull(message = "Le statut est obligatoire")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutAvis statut;

    @PrePersist
    protected void onCreate() {
        if (dateCreation == null) {
            dateCreation = LocalDateTime.now();
        }
        if (statut == null) {
            statut = StatutAvis.PUBLIE;
        }
    }
}
