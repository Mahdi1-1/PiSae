package com.projectmentor.communityservice.marketplace.service;

import com.projectmentor.communityservice.marketplace.model.*;
import com.projectmentor.communityservice.marketplace.repository.ApplicationRepository;
import com.projectmentor.communityservice.marketplace.repository.OpportunityRepository;
import com.projectmentor.communityservice.messaging.model.ChatMessage;
import com.projectmentor.communityservice.messaging.model.MessageType;
import com.projectmentor.communityservice.messaging.service.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Central orchestrator for the automated recruitment pipeline.
 * <p>
 * This dedicated service avoids circular dependencies between MarketplaceService ↔ QuizService
 * by owning all cross-cutting pipeline logic:
 * <ol>
 *   <li>Triggered by the deadline scheduler → classify candidates with AI + send quizzes</li>
 *   <li>Triggered after each quiz submission → check if all quizzes are done → send congratulations</li>
 * </ol>
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RecruitmentPipelineService {

    // limits are dynamic now, based on positionsAvailable

    private final OpportunityRepository opportunityRepository;
    private final ApplicationRepository applicationRepository;
    private final RecommendationService recommendationService;
    private final QuizService quizService;
    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    // ─────────────────────────────────────────────────────────────────────────
    // Phase 1 — Deadline reached: classify + send quizzes to top candidates
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Called by {@link DeadlineSchedulerService} when an opportunity's deadline has passed.
     * Marks the opportunity as EXPIRED, uses AI to rank applicants, and sends the quiz to
     * the top candidates (quizSentCount = max(3, positionsAvailable * 2)).
     */
    public void runDeadlinePipeline(Opportunity opportunity) {
        log.info("[Pipeline] Starting deadline pipeline for opportunity '{}' (id={})",
                opportunity.getTitle(), opportunity.getId());

        // Step 1 — Close new applications by marking as EXPIRED
        opportunity.setStatus(OpportunityStatus.EXPIRED);
        opportunityRepository.save(opportunity);

        // Step 2 — Determine dynamic limits based on positions available
        int positionsAvailable = opportunity.getPositionsAvailable() > 0 ? opportunity.getPositionsAvailable() : 1;
        int quizLimit = positionsAvailable * 3; // N * 3
        
        // Step 3 — AI ranking of all applicants
        List<OpportunityApplication> topCandidates;
        try {
            topCandidates = recommendationService.getTopCandidates(opportunity.getId(), quizLimit);
        } catch (Exception e) {
            log.error("[Pipeline] AI ranking failed for opportunityId={}: {}", opportunity.getId(), e.getMessage());
            return;
        }

        if (topCandidates.isEmpty()) {
            log.warn("[Pipeline] No candidates found for opportunityId={}", opportunity.getId());
            return;
        }

        // Step 4 — Send quiz to top candidates
        List<OpportunityApplication> quizRecipients = topCandidates.stream()
                .filter(app -> app.getQuizId() == null) // no quiz sent yet
                .collect(Collectors.toList());

        log.info("[Pipeline] Sending quiz to {} top candidates (target limit={}) for opportunityId={}",
                quizRecipients.size(), quizLimit, opportunity.getId());

        for (OpportunityApplication app : quizRecipients) {
            app.setStatus(ApplicationStatus.ACCEPTED);
            applicationRepository.save(app);
            try {
                quizService.generateAndSendQuiz(app, opportunity);
            } catch (Exception e) {
                log.error("[Pipeline] Failed to send quiz to candidateId={}: {}", app.getCandidateId(), e.getMessage());
            }
        }

        // Step 4 — Update counters and move to IN_PROGRESS
        opportunity.setQuizSentCount(quizRecipients.size());
        opportunity.setStatus(OpportunityStatus.IN_PROGRESS);
        opportunityRepository.save(opportunity);

        log.info("[Pipeline] Deadline pipeline complete for opportunityId={}. {} quiz(zes) sent.",
                opportunity.getId(), quizRecipients.size());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Phase 2 — Quiz completed: check counter and finalise if all done
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Called by {@link QuizService} after a quiz submission.
     * Increments the quiz-completed counter on the opportunity.
     * If all sent quizzes have been answered, triggers the congratulations + interview phase.
     */
    public void onQuizCompleted(String opportunityId) {
        Opportunity opportunity = opportunityRepository.findById(opportunityId).orElse(null);
        if (opportunity == null) {
            log.warn("[Pipeline] onQuizCompleted: opportunity not found for id={}", opportunityId);
            return;
        }

        // Increment counter
        int completed = opportunity.getQuizCompletedCount() + 1;
        opportunity.setQuizCompletedCount(completed);
        opportunityRepository.save(opportunity);

        log.info("[Pipeline] Quiz completed {}/{} for opportunityId={}",
                completed, opportunity.getQuizSentCount(), opportunityId);

        // Trigger congratulations only when ALL sent quizzes have been answered
        if (opportunity.getQuizSentCount() > 0 && completed >= opportunity.getQuizSentCount()) {
            log.info("[Pipeline] All quizzes answered for opportunityId={}. Triggering congratulations.", opportunityId);
            finaliseTopCandidates(opportunity);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Phase 3 — Congratulate top N winners and invite to interview
    // ─────────────────────────────────────────────────────────────────────────

    private void finaliseTopCandidates(Opportunity opportunity) {
        int positionsAvailable = opportunity.getPositionsAvailable() > 0 ? opportunity.getPositionsAvailable() : 1;

        // Fetch all applications that had a quiz, sorted by COMBINED weighted score desc
        List<OpportunityApplication> ranked = applicationRepository
                .findByOpportunityIdAndQuizIdNotNull(opportunity.getId())
                .stream()
                .filter(app -> app.getQuizScore() != null)
                .sorted((a, b) -> Double.compare(calculateTotalScore(b), calculateTotalScore(a)))
                .limit(positionsAvailable)
                .collect(Collectors.toList());

        log.info("[Pipeline] Congratulating top {} candidates for opportunityId={}", ranked.size(), opportunity.getId());

        for (OpportunityApplication winner : ranked) {
            winner.setStatus(ApplicationStatus.INTERVIEW);
            applicationRepository.save(winner);
            sendCongratulationsMessage(winner, opportunity);
        }

        // Close the opportunity
        opportunity.setStatus(OpportunityStatus.CLOSED);
        opportunity.setFinalisedCount(ranked.size());
        opportunityRepository.save(opportunity);

        log.info("[Pipeline] Opportunity '{}' (id={}) is now CLOSED. {} candidate(s) invited to interview.",
                opportunity.getTitle(), opportunity.getId(), ranked.size());
    }

    private void sendCongratulationsMessage(OpportunityApplication app, Opportunity opportunity) {
        String messageContent = String.format(
            "🎉 Félicitations ! Vous avez brillamment réussi le quiz technique pour le poste \"%s\". " +
            "Votre profil a été sélectionné parmi les meilleurs candidats. " +
            "Nous avons le plaisir de vous inviter à un entretien pour discuter de votre candidature. " +
            "Nous vous contacterons très prochainement pour fixer un rendez-vous. " +
            "Merci pour votre engagement et à bientôt ! 🚀",
            opportunity.getTitle()
        );

        ChatMessage message = ChatMessage.builder()
                .senderId("SYSTEM")
                .receiverId(app.getCandidateId())
                .content(messageContent)
                .sentAt(LocalDateTime.now())
                .read(false)
                .type(MessageType.PRIVATE)
                .build();

        ChatMessage saved = chatService.savePrivateMessage(message);

        // Real-time push via WebSocket
        messagingTemplate.convertAndSend("/topic/user/" + app.getCandidateId(), saved);

        log.info("[Pipeline] Congratulations message sent to candidateId={} for opportunityId={}",
                app.getCandidateId(), opportunity.getId());
    }

    /**
     * Calculates a combined weighted score for final candidate ranking.
     * Weights: 50% Quiz performance, 30% CV analysis, 20% Cover Letter analysis.
     */
    private double calculateTotalScore(OpportunityApplication app) {
        double quiz = app.getQuizScore() != null ? app.getQuizScore() : 0.0;
        double cv = app.getCvScore() != null ? app.getCvScore() : 0.0;
        double cl = app.getCoverLetterScore() != null ? app.getCoverLetterScore() : 0.0;

        // Quiz is 0-100, AI scores are 0-1.
        // Final score = (Quiz * 0.5) + (CV * 100 * 0.3) + (CL * 100 * 0.2)
        double total = (quiz * 0.5) + (cv * 100 * 0.3) + (cl * 100 * 0.2);
        
        log.debug("[Pipeline] Total score for candidate {}: {} (Quiz: {}, CV: {}, CL: {})",
                app.getCandidateId(), total, quiz, cv, cl);
                
        return total;
    }
}
