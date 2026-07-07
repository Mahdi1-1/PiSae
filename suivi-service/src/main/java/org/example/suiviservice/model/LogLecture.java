package org.example.suiviservice.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.example.suiviservice.Enum.RessourceType;

import java.time.LocalDateTime;

@Entity
@Table(name = "log_lecture")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LogLecture {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "L'identifiant de l'apprenant est obligatoire")
    @Column(name = "apprenant_id", nullable = false)
    private Long apprenantId;

    @NotNull(message = "L'identifiant de la formation est obligatoire")
    @Column(name = "formation_id", nullable = false)
    private Long formationId;

    @NotNull(message = "L'identifiant de la ressource est obligatoire")
    @Column(name = "ressource_id", nullable = false)
    private Long ressourceId;

    @NotNull(message = "Le type de ressource est obligatoire")
    @Enumerated(EnumType.STRING)
    @Column(name = "ressource_type", nullable = false)
    private RessourceType ressourceType;

    @NotNull(message = "Le temps passé est obligatoire")
    @Min(value = 0, message = "Le temps passé ne peut pas être négatif")
    @Column(name = "temps_passe_secondes", nullable = false)
    private Long tempsPasseSecondes;

    @NotNull
    @Column(name = "date_consultation", nullable = false)
    private LocalDateTime dateConsultation;

    @PrePersist
    protected void onCreate() {
        if (dateConsultation == null) {
            dateConsultation = LocalDateTime.now();
        }
    }
}
