package com.projectmentor.communityservice.reputation.service;

import com.projectmentor.communityservice.reputation.model.MemberLevel;
import com.projectmentor.communityservice.reputation.model.MemberReputation;
import com.projectmentor.communityservice.reputation.model.ReputationAction;
import com.projectmentor.communityservice.reputation.repository.ReputationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReputationService {

    private final ReputationRepository repository;
    private final com.projectmentor.communityservice.notification.service.NotificationService notificationService;

    // ── initialiser réputation d'un nouveau membre ──

    public MemberReputation initReputation(String memberId) {
        // éviter les doublons
        return repository.findByMemberId(memberId).orElseGet(() -> {
            MemberReputation rep = MemberReputation.builder()
                    .memberId(memberId)
                    .points(0)
                    .level(MemberLevel.EXPLORATEUR)
                    .globalScore(0)
                    .expertiseScore(0)
                    .reactivityScore(0)
                    .valueScore(0)
                    .badges(new ArrayList<>())
                    .recommendationsReceived(0)
                    .resourcesPublished(0)
                    .postsCount(0)
                    .commentsCount(0)
                    .lastUpdated(LocalDateTime.now())
                    .build();
            return repository.save(rep);
        });
    }

    // ── ajouter des points suite à une action ──

    public MemberReputation addPoints(String memberId, ReputationAction action) {
        MemberReputation rep = repository.findByMemberId(memberId)
                .orElseGet(() -> initReputation(memberId));

        rep.setPoints(rep.getPoints() + action.getPoints());

        // mettre à jour les compteurs selon l'action
        switch (action) {
            case POST_CREATED -> rep.setPostsCount(rep.getPostsCount() + 1);
            case COMMENT_ADDED -> rep.setCommentsCount(rep.getCommentsCount() + 1);
            case RESOURCE_PUBLISHED -> rep.setResourcesPublished(rep.getResourcesPublished() + 1);
            case RECOMMENDATION_RECEIVED -> rep.setRecommendationsReceived(rep.getRecommendationsReceived() + 1);
            default -> {}
        }

        // recalculer le niveau
        rep.setLevel(calculateLevel(rep.getPoints()));

        // recalculer le score global
        rep.setGlobalScore(calculateGlobalScore(rep));

        // vérifier les badges
        checkAndAwardBadges(rep);

        rep.setLastUpdated(LocalDateTime.now());
        MemberReputation saved = repository.save(rep);

        // Notify member
        try {
            notificationService.createAndSend(
                    memberId,
                    com.projectmentor.communityservice.notification.model.NotificationType.REPUTATION_GAINED,
                    "Vous avez gagné " + action.getPoints() + " points de réputation ! (" + action.name() + ")",
                    java.util.Map.of("points", String.valueOf(action.getPoints()), "newTotal", String.valueOf(saved.getPoints()))
            );
        } catch (Exception ignored) {}

        return saved;
    }

    // ── récupérer réputation d'un membre ──

    public MemberReputation getReputation(String memberId) {
        return repository.findByMemberId(memberId)
                .orElseGet(() -> initReputation(memberId));
    }

    // ── leaderboard ──

    public List<MemberReputation> getLeaderboard() {
        return repository.findTop10ByOrderByPointsDesc();
    }

    // ── calcul du niveau selon les points ──

    private MemberLevel calculateLevel(int points) {
        if (points >= 1500) return MemberLevel.AMBASSADEUR;
        if (points >= 700)  return MemberLevel.LEADER;
        if (points >= 300)  return MemberLevel.EXPERT;
        if (points >= 100)  return MemberLevel.CONTRIBUTEUR;
        return MemberLevel.EXPLORATEUR;
    }

    // ── calcul du score global 0-100 ──

    private double calculateGlobalScore(MemberReputation rep) {
        double score = 0;
        score += Math.min(rep.getPostsCount() * 2, 30);
        score += Math.min(rep.getCommentsCount() * 1, 20);
        score += Math.min(rep.getResourcesPublished() * 5, 25);
        score += Math.min(rep.getRecommendationsReceived() * 3, 25);
        return Math.min(score, 100);
    }

    // ── vérifier et attribuer les badges ──

    private void checkAndAwardBadges(MemberReputation rep) {
        List<String> badges = rep.getBadges();

        if (rep.getPostsCount() >= 10 && !badges.contains("Forum Active"))
            badges.add("Forum Active");

        if (rep.getResourcesPublished() >= 3 && !badges.contains("Knowledge Sharer"))
            badges.add("Knowledge Sharer");

        if (rep.getRecommendationsReceived() >= 5 && !badges.contains("Trusted Member"))
            badges.add("Trusted Member");

        if (rep.getPoints() >= 500 && !badges.contains("Rising Star"))
            badges.add("Rising Star");

        if (rep.getLevel() == MemberLevel.AMBASSADEUR && !badges.contains("Ambassadeur Tunisia"))
            badges.add("Ambassadeur Tunisia");
    }
}