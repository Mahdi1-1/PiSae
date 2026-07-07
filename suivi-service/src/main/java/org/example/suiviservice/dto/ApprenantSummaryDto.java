package org.example.suiviservice.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import lombok.NoArgsConstructor;

// Mapping partiel de userPI/model/User : on ne récupère que ce dont suivi-service a besoin.
// @JsonIgnoreProperties(ignoreUnknown = true) au cas où la config Jackson globale changerait —
// userPI renvoie aussi password/role/statut/dateInscription, qu'on ignore volontairement ici.
@Data
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class ApprenantSummaryDto {
    private Long id;
    private String name;
    private String prenom;
    private String email;
}
