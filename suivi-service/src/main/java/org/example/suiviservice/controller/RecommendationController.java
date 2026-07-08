package org.example.suiviservice.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.suiviservice.dto.MatchLevelRequest;
import org.example.suiviservice.dto.MatchLevelResponse;
import org.example.suiviservice.service.RecommendationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping("/api/recommendation")
@RequiredArgsConstructor
public class RecommendationController {

    private final RecommendationService recommendationService;

    // Matche le niveau (predit via ml-service, ou declare en repli) d'un cours au niveau de
    // l'apprenant. Ne renvoie jamais d'erreur liee a ml-service : voir RecommendationServiceImpl
    // pour le comportement de repli.
    @PostMapping("/match-level")
    public ResponseEntity<MatchLevelResponse> matchLevel(@Valid @RequestBody MatchLevelRequest request) {
        return ResponseEntity.ok(recommendationService.matchLevel(request));
    }
}
