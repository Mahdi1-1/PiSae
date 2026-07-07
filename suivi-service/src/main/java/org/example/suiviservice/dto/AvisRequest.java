package org.example.suiviservice.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

// Le statut n'est pas ici : un avis est toujours créé PUBLIE, et sa modération (SIGNALE/MASQUE)
// passe par un endpoint dédié (AvisModerationRequest), pas par la création/mise à jour du contenu.
@Data
public class AvisRequest {

    @NotNull(message = "L'identifiant de l'apprenant est obligatoire")
    private Long apprenantId;

    @NotNull(message = "L'identifiant de la formation est obligatoire")
    private Long formationId;

    @NotNull(message = "La note est obligatoire")
    @Min(value = 1, message = "La note minimale est 1")
    @Max(value = 5, message = "La note maximale est 5")
    private Integer note;

    private String commentaire;
}
