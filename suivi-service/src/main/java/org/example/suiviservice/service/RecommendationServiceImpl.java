package org.example.suiviservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.suiviservice.Enum.DifficultyLevel;
import org.example.suiviservice.client.MlServiceClient;
import org.example.suiviservice.dto.MatchLevelRequest;
import org.example.suiviservice.dto.MatchLevelResponse;
import org.example.suiviservice.dto.PredictDifficultyResponse;
import org.example.suiviservice.exception.InvalidRequestException;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class RecommendationServiceImpl implements RecommendationService {

    private final MlServiceClient mlServiceClient;

    @Override
    public MatchLevelResponse matchLevel(MatchLevelRequest request) {
        boolean hasText = StringUtils.hasText(request.getSkills()) || StringUtils.hasText(request.getDescription());
        boolean hasDeclaredLevel = StringUtils.hasText(request.getDeclaredLevel());

        if (!hasText && !hasDeclaredLevel) {
            throw new InvalidRequestException(
                    "Il faut fournir au moins skills/description (pour la prediction ML) "
                            + "ou declaredLevel (niveau declare du cours) pour effectuer un matching.");
        }

        DifficultyLevel learnerLevel = DifficultyLevel.fromString(request.getLearnerLevel())
                .orElseThrow(() -> new InvalidRequestException(
                        "learnerLevel invalide : doit etre Beginner, Intermediate ou Advanced."));

        Optional<PredictDifficultyResponse> prediction = hasText
                ? mlServiceClient.predictDifficulty(
                        emptyIfNull(request.getSkills()), emptyIfNull(request.getDescription()))
                : Optional.empty();

        Optional<DifficultyLevel> predictedLevel = prediction.flatMap(p -> DifficultyLevel.fromString(p.getDifficulty()));

        String predictedDifficulty = null;
        Double confidence = null;
        DifficultyLevel difficultyUsed;
        String source;

        if (predictedLevel.isPresent()) {
            predictedDifficulty = prediction.get().getDifficulty();
            confidence = prediction.get().getConfidence();
            difficultyUsed = predictedLevel.get();
            source = "ML_PREDICTION";
        } else {
            // Mode repli : ml-service indisponible/en erreur/timeout (Optional.empty() renvoye
            // par MlServiceClient), ou reponse dont "difficulty" n'est pas exploitable. Le moteur
            // continue a fonctionner en se basant uniquement sur le niveau declare du cours.
            if (hasText) {
                log.warn("Mode repli active pour le matching de niveau : prediction ML indisponible, "
                        + "utilisation du niveau declare du cours (declaredLevel={}).", request.getDeclaredLevel());
            }
            difficultyUsed = DifficultyLevel.fromString(request.getDeclaredLevel()).orElse(null);
            source = difficultyUsed != null ? "DECLARED_LEVEL_FALLBACK" : "UNKNOWN";
        }

        Double matchScore = difficultyUsed != null ? computeMatchScore(difficultyUsed, learnerLevel) : null;

        return new MatchLevelResponse(
                predictedDifficulty,
                difficultyUsed != null ? difficultyUsed.getLabel() : null,
                source,
                confidence,
                matchScore);
    }

    // 1.0 = meme niveau, 0.5 = niveaux adjacents (ex: Beginner/Intermediate), 0.0 = niveaux
    // opposes (Beginner/Advanced). Regle simple et explicable, suffisante en premiere iteration.
    private double computeMatchScore(DifficultyLevel courseLevel, DifficultyLevel learnerLevel) {
        int distance = Math.abs(courseLevel.ordinal() - learnerLevel.ordinal());
        return 1.0 - (distance / 2.0);
    }

    private String emptyIfNull(String value) {
        return value == null ? "" : value;
    }
}
