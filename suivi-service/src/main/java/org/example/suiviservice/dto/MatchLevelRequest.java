package org.example.suiviservice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

// skills/description alimentent la prediction ML (ml-service), declaredLevel est le niveau
// de repli utilise si ml-service est indisponible ou renvoie une reponse inexploitable.
// Au moins skills/description OU declaredLevel doit etre fourni (valide dans le service,
// car c'est une regle inter-champs que Bean Validation n'exprime pas simplement).
@Data
public class MatchLevelRequest {
    private String skills;
    private String description;
    private String declaredLevel;

    @NotBlank(message = "Le niveau de l'apprenant est obligatoire")
    private String learnerLevel;
}
