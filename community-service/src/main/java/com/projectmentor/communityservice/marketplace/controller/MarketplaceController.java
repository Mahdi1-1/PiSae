package com.projectmentor.communityservice.marketplace.controller;

import com.projectmentor.communityservice.marketplace.dto.ApplyDTO;
import com.projectmentor.communityservice.marketplace.dto.CreateOpportunityDTO;
import com.projectmentor.communityservice.marketplace.model.Opportunity;
import com.projectmentor.communityservice.marketplace.model.OpportunityApplication;
import com.projectmentor.communityservice.marketplace.service.MarketplaceService;
import com.projectmentor.communityservice.marketplace.service.RecommendationService;
import com.projectmentor.communityservice.marketplace.service.CandidateMLService;
import com.projectmentor.communityservice.marketplace.repository.OpportunityRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import com.projectmentor.communityservice.marketplace.service.FileStorageService;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/community/marketplace")
@RequiredArgsConstructor
@Slf4j
public class MarketplaceController {

    private final MarketplaceService marketplaceService;
    private final RecommendationService recommendationService;
    private final FileStorageService fileStorageService;
    private final CandidateMLService candidateMLService;
    private final OpportunityRepository opportunityRepository;

    // ── Opportunities ──────────────────────────────

    @PostMapping
    public Opportunity createOpportunity(@RequestBody CreateOpportunityDTO dto) {
        return marketplaceService.createOpportunity(dto);
    }

    @GetMapping
    public Page<Opportunity> getAllOpportunities(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return marketplaceService.getAllOpportunities(PageRequest.of(page, size));
    }

    @GetMapping("/sector/{sector}")
    public List<Opportunity> getBySector(@PathVariable String sector) {
        return marketplaceService.getOpportunitiesBySector(sector);
    }

    @GetMapping("/type/{type}")
    public Page<Opportunity> getByType(
            @PathVariable String type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "6") int size) {
        return marketplaceService.getOpportunitiesByTypePaginated(type, PageRequest.of(page, size));
    }

    @GetMapping("/{id}")
    public Opportunity getOpportunity(@PathVariable String id) {
        return marketplaceService.getOpportunityById(id);
    }

    @PutMapping("/{id}")
    public Opportunity updateOpportunity(
            @PathVariable String id,
            @RequestBody CreateOpportunityDTO dto) {
        return marketplaceService.updateOpportunity(id, dto);
    }

    @GetMapping("/my/{publisherId}")
    public List<Opportunity> getMyOpportunities(@PathVariable String publisherId) {
        return marketplaceService.getMyOpportunities(publisherId);
    }

    @PutMapping("/{id}/status")
    public Opportunity updateStatus(
            @PathVariable String id,
            @RequestParam String status) {
        return marketplaceService.updateStatus(id, status);
    }

    @DeleteMapping("/{id}")
    public void deleteOpportunity(@PathVariable String id) {
        marketplaceService.deleteOpportunity(id);
    }

    // ── Applications ───────────────────────────────

    @PostMapping("/{opportunityId}/apply")
    public OpportunityApplication apply(
            @PathVariable String opportunityId,
            @RequestBody ApplyDTO dto) {
        return marketplaceService.apply(opportunityId, dto);
    }

    @PostMapping(value = "/{opportunityId}/apply-with-file", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public OpportunityApplication applyWithFile(
            @PathVariable String opportunityId,
            @RequestParam("candidateId") String candidateId,
            @RequestParam("coverLetter") String coverLetter,
            @RequestParam("cvUrl") String cvUrl,
            @RequestParam("cvFile") MultipartFile cvFile) throws IOException {
        ApplyDTO dto = ApplyDTO.builder()
                .candidateId(candidateId)
                .coverLetter(coverLetter)
                .cvUrl(cvUrl)
                .build();
        return marketplaceService.applyWithFile(opportunityId, dto, cvFile);
    }

    @GetMapping("/applications/candidate/{candidateId}")
    public List<OpportunityApplication> getMyApplications(@PathVariable String candidateId) {
        return marketplaceService.getMyApplications(candidateId);
    }

    @GetMapping("/{opportunityId}/applications")
    public List<OpportunityApplication> getApplicationsForOpportunity(@PathVariable String opportunityId) {
        return marketplaceService.getApplicationsForOpportunity(opportunityId);
    }

    @PutMapping("/applications/{applicationId}/status")
    public OpportunityApplication updateApplicationStatus(
            @PathVariable String applicationId,
            @RequestParam String status) {
        log.info(">>> CONTROLLER: updateApplicationStatus called with id={}, status={}", applicationId, status);
        return marketplaceService.updateApplicationStatus(applicationId, status);
    }

    @PutMapping("/applications/{applicationId}/withdraw")
    public void withdrawApplication(@PathVariable String applicationId) {
        marketplaceService.withdrawApplication(applicationId);
    }

    @PostMapping("/{opportunityId}/send-quiz-to-top")
    public List<OpportunityApplication> sendQuizToTopCandidates(
            @PathVariable String opportunityId,
            @RequestParam(defaultValue = "0") int count) {
        return marketplaceService.sendQuizToTopCandidates(opportunityId, count);
    }

    @PostMapping("/applications/{applicationId}/finalise")
    public OpportunityApplication finaliseApplication(@PathVariable String applicationId) {
        return marketplaceService.finaliseApplication(applicationId);
    }

    // ── Recommendations ───────────────────────────────

    @GetMapping("/{opportunityId}/recommendations")
    public List<OpportunityApplication> getTopCandidates(@PathVariable String opportunityId) {
        return recommendationService.getTopCandidates(opportunityId);
    }

    // ── User Recommendations ───────────────────────

    /**
     * Get personalized opportunity recommendations for a user based on their CV
     * Uses advanced AI-powered matching algorithm
     */
    @GetMapping("/users/{userId}/recommendations")
    public List<Opportunity> getRecommendedOpportunitiesForUser(
            @PathVariable String userId,
            @RequestParam String cvUrl) {
        return recommendationService.getRecommendedOpportunitiesForUser(userId, cvUrl);
    }

    // ── ML Model Management ───────────────────────

    /**
     * Get ML model status and information
     */
    @GetMapping("/ml/status")
    public ResponseEntity<Map<String, Object>> getMLStatus() {
        Map<String, Object> status = candidateMLService.getModelStatus();
        return ResponseEntity.ok(status);
    }

    /**
     * Debug endpoint to test candidate scoring
     */
    @GetMapping("/{opportunityId}/debug-scoring")
    public ResponseEntity<Map<String, Object>> debugCandidateScoring(@PathVariable String opportunityId) {
        try {
            Opportunity opportunity = opportunityRepository.findById(opportunityId)
                    .orElseThrow(() -> new RuntimeException("Opportunity not found"));

            List<OpportunityApplication> applications = marketplaceService.getApplicationsForOpportunity(opportunityId);

            Map<String, Object> debugInfo = new HashMap<>();
            debugInfo.put("opportunity", Map.of(
                "id", opportunity.getId(),
                "title", opportunity.getTitle(),
                "skills", opportunity.getSkillsRequired()
            ));

            List<Map<String, Object>> applicationDebug = new ArrayList<>();
            for (OpportunityApplication app : applications) {
                Map<String, Object> appDebug = new HashMap<>();
                appDebug.put("id", app.getId());
                appDebug.put("candidateId", app.getCandidateId());

                // Test CV extraction
                String cvText = candidateMLService.getCvText(app);
                appDebug.put("cvTextLength", cvText != null ? cvText.length() : 0);
                appDebug.put("cvTextPreview", cvText != null && cvText.length() > 100 ?
                    cvText.substring(0, 100) + "..." : cvText);

                // Test skill extraction
                List<String> skills = candidateMLService.extractSkillsWithNLP(cvText);
                appDebug.put("extractedSkills", skills);

                // Test scoring
                double score = candidateMLService.scoreCandidate(app, opportunity);
                appDebug.put("finalScore", score);

                applicationDebug.add(appDebug);
            }

            debugInfo.put("applications", applicationDebug);
            debugInfo.put("totalApplications", applications.size());

            return ResponseEntity.ok(debugInfo);

        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // ── File Download ───────────────────────────────

    /** Use `{fileName:.+}` so stored names like `uuid_file.pdf` are not truncated at the first dot. */
    @GetMapping("/files/cv/{fileName:.+}")
    public ResponseEntity<byte[]> downloadCv(@PathVariable String fileName) throws IOException {
        String decodedFileName = URLDecoder.decode(fileName, StandardCharsets.UTF_8);
        log.info(">>> FILE DOWNLOAD REQUEST: fileName='{}', decoded='{}'", fileName, decodedFileName);

        try {
            byte[] fileBytes = fileStorageService.getFileBytes(decodedFileName);

            // Determine content type based on file extension
            String lowerFileName = decodedFileName.toLowerCase();
            String contentType = "application/pdf";
            if (lowerFileName.endsWith(".pdf")) {
                contentType = "application/pdf";
            } else if (lowerFileName.endsWith(".doc")) {
                contentType = "application/msword";
            } else if (lowerFileName.endsWith(".docx")) {
                contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            } else if (lowerFileName.endsWith(".png")) {
                contentType = "image/png";
            } else if (lowerFileName.endsWith(".jpg") || lowerFileName.endsWith(".jpeg")) {
                contentType = "image/jpeg";
            } else if (lowerFileName.endsWith(".gif")) {
                contentType = "image/gif";
            } else if (lowerFileName.endsWith(".webp")) {
                contentType = "image/webp";
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header("Content-Disposition", "inline; filename=\"" + decodedFileName + "\"")
                    .body(fileBytes);
        } catch (RuntimeException ex) {
            if (ex.getMessage() != null && ex.getMessage().startsWith("File not found:")) {
                log.warn("CV download failed: file not found for '{}'. returning 404.", decodedFileName);
                return ResponseEntity.notFound().build();
            }
            log.error("Unexpected error while downloading CV for '{}'.", decodedFileName, ex);
            throw ex;
        }
    }
}