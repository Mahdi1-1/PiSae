package com.projectmentor.communityservice.marketplace.service;

import com.projectmentor.communityservice.marketplace.model.Opportunity;
import com.projectmentor.communityservice.marketplace.repository.OpportunityRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Scheduler that periodically checks for job offers whose application deadline
 * has passed.
 * When an offer expires, it delegates the full automation pipeline to
 * {@link RecruitmentPipelineService}.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DeadlineSchedulerService {

    private final OpportunityRepository opportunityRepository;
    private final RecruitmentPipelineService recruitmentPipelineService;

    /**
     * Runs every minute (60 000 ms).
     * Finds all OPEN opportunities whose {@code expiresAt} is in the past and
     * triggers the pipeline.
     */
    @Scheduled(fixedDelay = 60_000)
    public void checkExpiredOpportunities() {
        // Use UTC time for database comparison to avoid timezone mismatches
        LocalDateTime now = LocalDateTime.now(java.time.ZoneOffset.UTC);
        List<Opportunity> expired = opportunityRepository.findExpiredOpenOpportunities(now);

        if (expired.isEmpty()) {
            log.debug("[Scheduler] No expired opportunities found at {}", now);
            return;
        }

        log.info("[Scheduler] Found {} expired opportunity(ies) at {}. Triggering pipelines.", expired.size(), now);
        for (Opportunity opportunity : expired) {
            try {
                recruitmentPipelineService.runDeadlinePipeline(opportunity);
            } catch (Exception e) {
                log.error("[Scheduler] Pipeline failed for opportunityId={}: {}", opportunity.getId(), e.getMessage(),
                        e);
            }
        }
    }
}