package com.projectmentor.communityservice.marketplace.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class GroqService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${groq.api.key:gsk_placeholder_key}")
    private String apiKey;

    private static final String GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

    public String generateQuizJson(String jobTitle, String description, List<String> skills) {
        String prompt = String.format(
            "Générer un quiz technique pour le poste de '%s'.\n" +
            "Description du poste : %s\n" +
            "Compétences requises : %s\n\n" +
            "Le quiz doit contenir 5 questions à choix multiples (QCM) avec 4 options chacune.\n" +
            "Le format de réponse doit être strictement un JSON valide comme suit :\n" +
            "[\n" +
            "  {\n" +
            "    \"questionText\": \"Texte de la question\",\n" +
            "    \"options\": [\"Option A\", \"Option B\", \"Option C\", \"Option D\"],\n" +
            "    \"correctAnswerIndex\": 0,\n" +
            "    \"explanation\": \"Explication de la bonne réponse\"\n" +
            "  }\n" +
            "]\n" +
            "Répondez uniquement avec le JSON.",
            jobTitle, description, String.join(", ", skills)
        );

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", "llama-3.3-70b-versatile");
            
            List<Map<String, String>> messages = new ArrayList<>();
            messages.add(Map.of("role", "user", "content", prompt));
            requestBody.put("messages", messages);
            requestBody.put("temperature", 0.7);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(GROQ_API_URL, entity, String.class);

            if (response.getStatusCode() == HttpStatus.OK) {
                JsonNode root = objectMapper.readTree(response.getBody());
                String content = root.path("choices").get(0).path("message").path("content").asText();
                
                String json = content.trim();
                if (json.contains("[") && json.contains("]")) {
                    int start = json.indexOf("[");
                    int end = json.lastIndexOf("]") + 1;
                    json = json.substring(start, end);
                }
                
                return json;
            } else {
                log.error("Groq API error: {} - {}", response.getStatusCode(), response.getBody());
                return null;
            }
        } catch (Exception e) {
            log.error("Error calling Groq API", e);
            return null;
        }
    }
}
