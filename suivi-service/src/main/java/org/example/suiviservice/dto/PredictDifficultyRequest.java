package org.example.suiviservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// Miroir exact du body attendu par POST /predict-difficulty de ml-service
// (voir ml-service/INTEGRATION.md).
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PredictDifficultyRequest {
    private String skills;
    private String description;
}
