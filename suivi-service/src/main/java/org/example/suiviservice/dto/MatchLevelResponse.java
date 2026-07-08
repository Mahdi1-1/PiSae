package org.example.suiviservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MatchLevelResponse {
    // Niveau brut renvoye par ml-service, null si la prediction a echoue (ml-service
    // indisponible/timeout/erreur) ou n'a pas ete demandee (pas de skills/description fournis).
    private String predictedDifficulty;

    // Niveau effectivement utilise pour calculer matchScore : celui predit par ml-service
    // si disponible, sinon le niveau declare du cours (mode repli), sinon null.
    private String difficultyUsed;

    // "ML_PREDICTION" | "DECLARED_LEVEL_FALLBACK" | "UNKNOWN"
    private String source;

    // Confiance renvoyee par ml-service (null en mode repli).
    private Double confidence;

    // 1.0 = niveau identique, 0.5 = niveau adjacent, 0.0 = niveaux opposes ; null si
    // difficultyUsed n'a pas pu etre determine.
    private Double matchScore;
}
