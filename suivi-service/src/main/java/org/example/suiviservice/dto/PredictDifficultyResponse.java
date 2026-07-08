package org.example.suiviservice.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

// Miroir exact de la reponse de POST /predict-difficulty de ml-service
// (voir ml-service/INTEGRATION.md). "difficulty" vaut "Beginner" | "Intermediate" | "Advanced",
// "confidence" est la probabilite de la classe predite, "probabilities" la distribution complete.
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class PredictDifficultyResponse {
    private String difficulty;
    private Double confidence;
    private Map<String, Double> probabilities;
}
