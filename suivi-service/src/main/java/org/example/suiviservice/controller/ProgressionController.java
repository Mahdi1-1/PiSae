package org.example.suiviservice.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.suiviservice.dto.ApprenantResumeResponse;
import org.example.suiviservice.dto.InactiviteResponse;
import org.example.suiviservice.dto.ProgressionRequest;
import org.example.suiviservice.dto.ProgressionResponse;
import org.example.suiviservice.service.ApprenantResumeService;
import org.example.suiviservice.service.InactiviteService;
import org.example.suiviservice.service.ProgressionService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/progression")
@RequiredArgsConstructor
public class ProgressionController {

    private final ProgressionService progressionService;
    private final ApprenantResumeService apprenantResumeService;
    private final InactiviteService inactiviteService;

    // Upsert : crée la progression si elle n'existe pas encore pour ce couple/triplet, sinon
    // met à jour le pourcentage existant — voir ProgressionServiceImpl pour la justification.
    @PostMapping
    public ResponseEntity<ProgressionResponse> createOrUpdate(@Valid @RequestBody ProgressionRequest request) {
        return ResponseEntity.ok(progressionService.createOrUpdate(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProgressionResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(progressionService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProgressionResponse> update(
            @PathVariable Long id, @Valid @RequestBody ProgressionRequest request) {
        return ResponseEntity.ok(progressionService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        progressionService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<Page<ProgressionResponse>> getByFormation(
            @RequestParam Long formationId,
            @PageableDefault(size = 20, sort = "dateDerniereMaj") Pageable pageable) {
        return ResponseEntity.ok(progressionService.getByFormation(formationId, pageable));
    }

    @GetMapping("/apprenant/{apprenantId}")
    public ResponseEntity<List<ProgressionResponse>> getByApprenant(@PathVariable Long apprenantId) {
        return ResponseEntity.ok(progressionService.getByApprenant(apprenantId));
    }

    // Progression globale d'un apprenant : moyenne %, nb formations terminées, temps total passé
    @GetMapping("/apprenant/{apprenantId}/resume")
    public ResponseEntity<ApprenantResumeResponse> getResume(@PathVariable Long apprenantId) {
        return ResponseEntity.ok(apprenantResumeService.getResume(apprenantId));
    }

    // Apprenants sans mise à jour de progression depuis "jours" jours (défaut 7)
    @GetMapping("/inactifs")
    public ResponseEntity<List<InactiviteResponse>> getInactifs(
            @RequestParam(defaultValue = "7") int jours) {
        return ResponseEntity.ok(inactiviteService.getApprenantsInactifs(jours));
    }
}
