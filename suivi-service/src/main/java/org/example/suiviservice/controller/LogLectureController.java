package org.example.suiviservice.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.suiviservice.dto.LogLectureRequest;
import org.example.suiviservice.dto.LogLectureResponse;
import org.example.suiviservice.service.LogLectureService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/logs")
@RequiredArgsConstructor
public class LogLectureController {

    private final LogLectureService logLectureService;

    @PostMapping
    public ResponseEntity<LogLectureResponse> create(@Valid @RequestBody LogLectureRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(logLectureService.create(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<LogLectureResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(logLectureService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<LogLectureResponse> update(
            @PathVariable Long id, @Valid @RequestBody LogLectureRequest request) {
        return ResponseEntity.ok(logLectureService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        logLectureService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // GET /api/logs?formationId=X&dateDebut=...&dateFin=...&page=&size=&sort=
    @GetMapping
    public ResponseEntity<Page<LogLectureResponse>> search(
            @RequestParam Long formationId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateDebut,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateFin,
            @PageableDefault(size = 20, sort = "dateConsultation") Pageable pageable) {
        return ResponseEntity.ok(logLectureService.search(formationId, dateDebut, dateFin, pageable));
    }

    @GetMapping("/apprenant/{apprenantId}/formation/{formationId}")
    public ResponseEntity<Page<LogLectureResponse>> getByApprenantAndFormation(
            @PathVariable Long apprenantId,
            @PathVariable Long formationId,
            @PageableDefault(size = 20, sort = "dateConsultation") Pageable pageable) {
        return ResponseEntity.ok(logLectureService.getByApprenantAndFormation(apprenantId, formationId, pageable));
    }

    @GetMapping("/apprenant/{apprenantId}")
    public ResponseEntity<List<LogLectureResponse>> getByApprenant(@PathVariable Long apprenantId) {
        return ResponseEntity.ok(logLectureService.getByApprenant(apprenantId));
    }
}
