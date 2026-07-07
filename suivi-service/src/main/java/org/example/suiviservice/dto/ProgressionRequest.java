package org.example.suiviservice.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

// Le statut n'est volontairement pas ici : il est recalculé par le service à partir du
// pourcentage (0 => NON_COMMENCE, 100 => TERMINE, sinon EN_COURS), jamais fourni par le client.
@Data
public class ProgressionRequest {

    @NotNull(message = "L'identifiant de l'apprenant est obligatoire")
    private Long apprenantId;

    @NotNull(message = "L'identifiant de la formation est obligatoire")
    private Long formationId;

    // Null si la progression est suivie au niveau formation (pas un chapitre précis)
    private Long chapitreId;

    @NotNull(message = "Le pourcentage est obligatoire")
    @Min(value = 0, message = "Le pourcentage ne peut pas être négatif")
    @Max(value = 100, message = "Le pourcentage ne peut pas dépasser 100")
    private Integer pourcentage;
}
