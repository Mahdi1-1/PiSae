package org.example.suiviservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AvisStatsResponse {
    private Long formationId;
    private double noteMoyenne;
    private long nombreAvis;
    // note (1 à 5) -> nombre d'avis avec cette note ; toutes les clés 1..5 sont présentes,
    // même à 0, pour que le client n'ait pas à gérer les clés manquantes.
    private Map<Integer, Long> repartitionNotes;
}
