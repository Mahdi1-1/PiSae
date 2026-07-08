package org.example.suiviservice.Enum;

import java.util.Optional;

// Aligne sur les 3 classes renvoyees par ml-service (voir ml-service/INTEGRATION.md :
// "Beginner" | "Intermediate" | "Advanced"), reutilise aussi pour le niveau declare
// d'un cours et le niveau de l'apprenant lors du matching.
public enum DifficultyLevel {
    BEGINNER("Beginner"),
    INTERMEDIATE("Intermediate"),
    ADVANCED("Advanced");

    private final String label;

    DifficultyLevel(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }

    public static Optional<DifficultyLevel> fromString(String value) {
        if (value == null || value.isBlank()) {
            return Optional.empty();
        }
        String trimmed = value.trim();
        for (DifficultyLevel level : values()) {
            if (level.label.equalsIgnoreCase(trimmed) || level.name().equalsIgnoreCase(trimmed)) {
                return Optional.of(level);
            }
        }
        return Optional.empty();
    }
}
