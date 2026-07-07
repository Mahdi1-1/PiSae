package org.example.suiviservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.suiviservice.Enum.StatutProgression;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProgressionResponse {
    private Long id;
    private Long apprenantId;
    private Long formationId;
    private Long chapitreId;
    private Integer pourcentage;
    private LocalDateTime dateDebut;
    private LocalDateTime dateDerniereMaj;
    private StatutProgression statut;
}
