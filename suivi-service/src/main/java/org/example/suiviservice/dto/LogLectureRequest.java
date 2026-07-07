package org.example.suiviservice.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.example.suiviservice.Enum.RessourceType;

// dateConsultation n'est pas ici : elle est fixée à "maintenant" par le service à la création
// (voir Progression/LogLecture @PrePersist) — un log de lecture n'a pas de sens antidaté par le client.
@Data
public class LogLectureRequest {

    @NotNull(message = "L'identifiant de l'apprenant est obligatoire")
    private Long apprenantId;

    @NotNull(message = "L'identifiant de la formation est obligatoire")
    private Long formationId;

    @NotNull(message = "L'identifiant de la ressource est obligatoire")
    private Long ressourceId;

    @NotNull(message = "Le type de ressource est obligatoire")
    private RessourceType ressourceType;

    @NotNull(message = "Le temps passé est obligatoire")
    @Min(value = 0, message = "Le temps passé ne peut pas être négatif")
    private Long tempsPasseSecondes;
}
