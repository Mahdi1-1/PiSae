package org.example.suiviservice.service;

import org.example.suiviservice.dto.InactiviteResponse;

import java.util.List;

public interface InactiviteService {

    // Apprenants dont la dernière mise à jour de progression date de plus de "jours" jours.
    List<InactiviteResponse> getApprenantsInactifs(int jours);
}
