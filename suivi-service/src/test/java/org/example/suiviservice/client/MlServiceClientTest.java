package org.example.suiviservice.client;

import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import okhttp3.mockwebserver.RecordedRequest;
import org.example.suiviservice.dto.PredictDifficultyResponse;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.reactive.function.client.WebClient;

import java.io.IOException;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class MlServiceClientTest {

    private static final long TIMEOUT_MS = 300;

    private MockWebServer server;
    private MlServiceClient client;

    @BeforeEach
    void setUp() throws IOException {
        server = new MockWebServer();
        server.start();
        client = new MlServiceClient(WebClient.builder(), server.url("/").toString(), TIMEOUT_MS);
    }

    @AfterEach
    void tearDown() throws IOException {
        try {
            server.shutdown();
        } catch (IOException ignored) {
            // deja arrete par le test lui-meme (cas "service injoignable")
        }
    }

    @Test
    void predictDifficulty_reponseNormale_retourneLaPrediction() throws InterruptedException {
        server.enqueue(new MockResponse()
                .setHeader("Content-Type", "application/json")
                .setBody("""
                        {
                          "difficulty": "Beginner",
                          "confidence": 0.62,
                          "probabilities": {"Advanced": 0.12, "Beginner": 0.62, "Intermediate": 0.26}
                        }
                        """));

        Optional<PredictDifficultyResponse> result = client.predictDifficulty(
                "python programming, data structures", "Intro course for absolute beginners");

        assertTrue(result.isPresent());
        assertEquals("Beginner", result.get().getDifficulty());
        assertEquals(0.62, result.get().getConfidence());
        assertEquals(0.62, result.get().getProbabilities().get("Beginner"));

        RecordedRequest recorded = server.takeRequest();
        assertEquals("POST", recorded.getMethod());
        assertEquals("/predict-difficulty", recorded.getPath());
        assertTrue(recorded.getBody().readUtf8().contains("\"skills\":\"python programming, data structures\""));
    }

    @Test
    void predictDifficulty_erreur500_retourneOptionalVide() {
        server.enqueue(new MockResponse().setResponseCode(500).setBody("Internal Server Error"));

        Optional<PredictDifficultyResponse> result = client.predictDifficulty("skills", "description");

        assertTrue(result.isEmpty());
    }

    @Test
    void predictDifficulty_reponse422_retourneOptionalVide() {
        server.enqueue(new MockResponse().setResponseCode(422)
                .setBody("{\"detail\":\"skills et description ne peuvent pas etre vides tous les deux.\"}"));

        Optional<PredictDifficultyResponse> result = client.predictDifficulty("", "");

        assertTrue(result.isEmpty());
    }

    @Test
    void predictDifficulty_timeoutDepasse_retourneOptionalVide() {
        server.enqueue(new MockResponse()
                .setBodyDelay(TIMEOUT_MS * 5, TimeUnit.MILLISECONDS)
                .setBody("{}"));

        Optional<PredictDifficultyResponse> result = client.predictDifficulty("skills", "description");

        assertTrue(result.isEmpty());
    }

    @Test
    void predictDifficulty_serviceInjoignable_retourneOptionalVide() throws IOException {
        server.shutdown();

        Optional<PredictDifficultyResponse> result = client.predictDifficulty("skills", "description");

        assertTrue(result.isEmpty());
    }
}
