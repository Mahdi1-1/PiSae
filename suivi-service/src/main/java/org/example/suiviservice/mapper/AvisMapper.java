package org.example.suiviservice.mapper;

import org.example.suiviservice.dto.AvisResponse;
import org.example.suiviservice.model.Avis;

public final class AvisMapper {

    private AvisMapper() {
    }

    public static AvisResponse toResponse(Avis avis) {
        return new AvisResponse(
                avis.getId(),
                avis.getApprenantId(),
                avis.getFormationId(),
                avis.getNote(),
                avis.getCommentaire(),
                avis.getDateCreation(),
                avis.getStatut()
        );
    }
}
