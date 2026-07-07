package org.example.suiviservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.suiviservice.client.UserPiClient;
import org.example.suiviservice.dto.ApprenantSummaryDto;
import org.example.suiviservice.dto.InactiviteResponse;
import org.example.suiviservice.model.Progression;
import org.example.suiviservice.repository.ProgressionRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class InactiviteServiceImpl implements InactiviteService {

    private final ProgressionRepository progressionRepository;
    private final UserPiClient userPiClient;

    @Override
    public List<InactiviteResponse> getApprenantsInactifs(int jours) {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(jours);
        List<Long> apprenantIds = progressionRepository.findApprenantIdsInactifsDepuis(cutoff);

        return apprenantIds.stream()
                .map(this::toInactiviteResponse)
                .toList();
    }

    private InactiviteResponse toInactiviteResponse(Long apprenantId) {
        LocalDateTime derniereActivite = progressionRepository
                .findTopByApprenantIdOrderByDateDerniereMajDesc(apprenantId)
                .map(Progression::getDateDerniereMaj)
                .orElse(null);

        // L'enrichissement via userPI est un "bonus" : si userPI est indisponible ou l'apprenant
        // introuvable, on renvoie quand même l'inactivité détectée (c'est le cœur de la feature),
        // juste sans nom/prenom/email.
        ApprenantSummaryDto apprenant = null;
        try {
            apprenant = userPiClient.getApprenantById(apprenantId);
        } catch (Exception ex) {
            log.warn("Impossible de récupérer les infos de l'apprenant {} depuis userPI : {}",
                    apprenantId, ex.getMessage());
        }

        if (apprenant == null) {
            return new InactiviteResponse(apprenantId, derniereActivite, null, null, null);
        }
        return new InactiviteResponse(apprenantId, derniereActivite,
                apprenant.getName(), apprenant.getPrenom(), apprenant.getEmail());
    }
}
