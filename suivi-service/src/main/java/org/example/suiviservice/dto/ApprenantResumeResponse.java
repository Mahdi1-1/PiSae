package org.example.suiviservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApprenantResumeResponse {
    private Long apprenantId;
    private double moyennePourcentage;
    private long nombreFormationsTerminees;
    private long tempsTotalPasseSecondes;
}
