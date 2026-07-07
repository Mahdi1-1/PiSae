package org.example.suiviservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InactiviteResponse {
    private Long apprenantId;
    private LocalDateTime derniereActivite;
    // Enrichis via userPI (Feign) ; null si userPI est indisponible ou l'apprenant introuvable —
    // l'inactivité reste rapportée même sans ces infos, elle n'est pas bloquée par userPI.
    private String nom;
    private String prenom;
    private String email;
}
