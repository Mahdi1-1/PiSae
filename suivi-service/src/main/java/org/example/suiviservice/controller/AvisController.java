package org.example.suiviservice.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.suiviservice.dto.AvisModerationRequest;
import org.example.suiviservice.dto.AvisRequest;
import org.example.suiviservice.dto.AvisResponse;
import org.example.suiviservice.dto.AvisStatsResponse;
import org.example.suiviservice.service.AvisService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/avis")
@RequiredArgsConstructor
public class AvisController {

    private final AvisService avisService;

    // Lève AvisDejaExistantException (409) si l'apprenant a déjà noté cette formation
    @PostMapping
    public ResponseEntity<AvisResponse> create(@Valid @RequestBody AvisRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(avisService.create(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AvisResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(avisService.getById(id));
    }

    // Modifie le contenu (note/commentaire) — pas le statut de modération
    @PutMapping("/{id}")
    public ResponseEntity<AvisResponse> update(@PathVariable Long id, @Valid @RequestBody AvisRequest request) {
        return ResponseEntity.ok(avisService.updateContenu(id, request));
    }

    // Modération basique : change uniquement le statut (PUBLIE/SIGNALE/MASQUE)
    @PatchMapping("/{id}/statut")
    public ResponseEntity<AvisResponse> moderer(
            @PathVariable Long id, @Valid @RequestBody AvisModerationRequest request) {
        return ResponseEntity.ok(avisService.moderer(id, request.getStatut()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        avisService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // Le tri (plus récent d'abord) est déjà fixé par le repository (findByFormationIdOrderByDateCreationDesc) ;
    // le Pageable ne sert ici qu'à la pagination (page/size), pas à trier sur un autre champ.
    @GetMapping
    public ResponseEntity<Page<AvisResponse>> getByFormation(
            @RequestParam Long formationId,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(avisService.getByFormation(formationId, pageable));
    }

    // Note moyenne, nombre d'avis, répartition des notes (1 à 5) — sur les avis PUBLIE uniquement
    @GetMapping("/formation/{formationId}/stats")
    public ResponseEntity<AvisStatsResponse> getStats(@PathVariable Long formationId) {
        return ResponseEntity.ok(avisService.getStats(formationId));
    }
}
