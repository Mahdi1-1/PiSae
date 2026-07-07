package com.projectmentor.communityservice.marketplace.model;

import lombok.*;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizQuestion {

    private String questionText;

    private List<String> options;

    private Integer correctAnswerIndex;

    private Integer candidateAnswerIndex;

    private String explanation;
}
