package com.projectmentor.communityservice.marketplace.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "quizzes")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Quiz {

    @Id
    private String id;

    private String opportunityId;

    private String applicationId;

    private String candidateId;

    private List<QuizQuestion> questions;

    private LocalDateTime createdAt;

    private LocalDateTime completedAt;

    private Double score;

    private Integer timeLimit;

    private boolean completed;
}
