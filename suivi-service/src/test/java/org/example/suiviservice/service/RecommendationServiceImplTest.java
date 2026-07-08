package org.example.suiviservice.service;

import org.example.suiviservice.client.MlServiceClient;
import org.example.suiviservice.dto.MatchLevelRequest;
import org.example.suiviservice.dto.MatchLevelResponse;
import org.example.suiviservice.dto.PredictDifficultyResponse;
import org.example.suiviservice.exception.InvalidRequestException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RecommendationServiceImplTest {

    @Mock
    private MlServiceClient mlServiceClient;

    @InjectMocks
    private RecommendationServiceImpl recommendationService;

    @Test
    void matchLevel_predictionMlDisponible_utiliseLaPredictionEtCalculeLeScore() {
        MatchLevelRequest request = new MatchLevelRequest();
        request.setSkills("python, data structures");
        request.setDescription("Intro course for absolute beginners");
        request.setLearnerLevel("Beginner");

        PredictDifficultyResponse mlResponse = new PredictDifficultyResponse(
                "Beginner", 0.62, Map.of("Advanced", 0.12, "Beginner", 0.62, "Intermediate", 0.26));
        when(mlServiceClient.predictDifficulty(anyString(), anyString())).thenReturn(Optional.of(mlResponse));

        MatchLevelResponse response = recommendationService.matchLevel(request);

        assertEquals("Beginner", response.getPredictedDifficulty());
        assertEquals("Beginner", response.getDifficultyUsed());
        assertEquals("ML_PREDICTION", response.getSource());
        assertEquals(0.62, response.getConfidence());
        assertEquals(1.0, response.getMatchScore());
    }

    @Test
    void matchLevel_mlServiceIndisponible_basculeSurLeNiveauDeclare() {
        MatchLevelRequest request = new MatchLevelRequest();
        request.setSkills("python, data structures");
        request.setDescription("Intro course for absolute beginners");
        request.setDeclaredLevel("Intermediate");
        request.setLearnerLevel("Beginner");

        when(mlServiceClient.predictDifficulty(anyString(), anyString())).thenReturn(Optional.empty());

        MatchLevelResponse response = recommendationService.matchLevel(request);

        assertNull(response.getPredictedDifficulty());
        assertEquals("Intermediate", response.getDifficultyUsed());
        assertEquals("DECLARED_LEVEL_FALLBACK", response.getSource());
        assertNull(response.getConfidence());
        assertEquals(0.5, response.getMatchScore());
    }

    @Test
    void matchLevel_mlServiceIndisponibleEtPasDeNiveauDeclare_sourceInconnueEtScoreNull() {
        MatchLevelRequest request = new MatchLevelRequest();
        request.setSkills("python");
        request.setDescription("intro");
        request.setLearnerLevel("Advanced");

        when(mlServiceClient.predictDifficulty(anyString(), anyString())).thenReturn(Optional.empty());

        MatchLevelResponse response = recommendationService.matchLevel(request);

        assertNull(response.getPredictedDifficulty());
        assertNull(response.getDifficultyUsed());
        assertEquals("UNKNOWN", response.getSource());
        assertNull(response.getMatchScore());
    }

    @Test
    void matchLevel_niAucunTexteNiNiveauDeclare_leveInvalidRequestException() {
        MatchLevelRequest request = new MatchLevelRequest();
        request.setLearnerLevel("Beginner");

        assertThrows(InvalidRequestException.class, () -> recommendationService.matchLevel(request));
    }

    @Test
    void matchLevel_learnerLevelInvalide_leveInvalidRequestException() {
        MatchLevelRequest request = new MatchLevelRequest();
        request.setDeclaredLevel("Beginner");
        request.setLearnerLevel("Expert");

        assertThrows(InvalidRequestException.class, () -> recommendationService.matchLevel(request));
    }

    @Test
    void matchLevel_niveauxOpposes_matchScoreZero() {
        MatchLevelRequest request = new MatchLevelRequest();
        request.setDeclaredLevel("Advanced");
        request.setLearnerLevel("Beginner");

        MatchLevelResponse response = recommendationService.matchLevel(request);

        assertEquals("DECLARED_LEVEL_FALLBACK", response.getSource());
        assertEquals(0.0, response.getMatchScore());
    }
}
