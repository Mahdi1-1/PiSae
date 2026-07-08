package org.example.suiviservice.service;

import org.example.suiviservice.dto.MatchLevelRequest;
import org.example.suiviservice.dto.MatchLevelResponse;

public interface RecommendationService {

    // Matche le niveau (predit via ml-service ou declare en repli) d'un cours au niveau
    // de l'apprenant. Ne leve jamais d'exception liee a ml-service : bascule en mode repli
    // silencieusement (avec log) si la prediction ML n'est pas disponible.
    MatchLevelResponse matchLevel(MatchLevelRequest request);
}
