package org.example.suiviservice.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.example.suiviservice.Enum.StatutAvis;

// Utilisé par l'endpoint de modération (PATCH), séparé de la mise à jour de contenu (PUT)
// pour ne pas mélanger "l'apprenant modifie son avis" et "un modérateur change son statut".
@Data
public class AvisModerationRequest {

    @NotNull(message = "Le statut est obligatoire")
    private StatutAvis statut;
}
