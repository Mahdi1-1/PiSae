package com.projectmentor.communityservice.reputation.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "member_reputations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MemberReputation {

    @Id
    private String id;

    private String memberId;        // lié au userId

    private int points;             // points d'expérience cumulés

    private MemberLevel level;      // EXPLORATEUR → AMBASSADEUR

    private double globalScore;     // score global 0-100

    private double expertiseScore;

    private double reactivityScore;

    private double valueScore;

    @Builder.Default
    private List<String> badges = new ArrayList<>();

    private int recommendationsReceived;

    private int resourcesPublished;

    private int postsCount;

    private int commentsCount;

    private LocalDateTime lastUpdated;
}