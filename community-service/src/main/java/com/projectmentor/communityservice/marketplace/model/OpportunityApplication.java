package com.projectmentor.communityservice.marketplace.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "opportunity_applications")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OpportunityApplication {

    @Id
    private String id;

    private String opportunityId;

    private String candidateId;

    private String cvUrl;

    private String coverLetter;

    private ApplicationStatus status;  // SENT / VIEWED / INTERVIEW / ACCEPTED / REJECTED / WITHDRAWN

    private Double quizScore;

    private Double cvScore;

    private Double coverLetterScore;

    private String quizId;

    private LocalDateTime appliedAt;
}