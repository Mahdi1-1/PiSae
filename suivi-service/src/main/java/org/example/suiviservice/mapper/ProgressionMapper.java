package org.example.suiviservice.mapper;

import org.example.suiviservice.dto.ProgressionResponse;
import org.example.suiviservice.model.Progression;

public final class ProgressionMapper {

    private ProgressionMapper() {
    }

    public static ProgressionResponse toResponse(Progression progression) {
        return new ProgressionResponse(
                progression.getId(),
                progression.getApprenantId(),
                progression.getFormationId(),
                progression.getChapitreId(),
                progression.getPourcentage(),
                progression.getDateDebut(),
                progression.getDateDerniereMaj(),
                progression.getStatut()
        );
    }
}
