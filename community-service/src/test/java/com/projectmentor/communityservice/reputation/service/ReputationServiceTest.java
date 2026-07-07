package com.projectmentor.communityservice.reputation.service;

import com.projectmentor.communityservice.notification.service.NotificationService;
import com.projectmentor.communityservice.reputation.model.MemberLevel;
import com.projectmentor.communityservice.reputation.model.MemberReputation;
import com.projectmentor.communityservice.reputation.model.ReputationAction;
import com.projectmentor.communityservice.reputation.repository.ReputationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReputationServiceTest {

    @Mock
    private ReputationRepository repository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private ReputationService reputationService;

    private String memberId;

    @BeforeEach
    void setUp() {
        memberId = "user123";
    }

    @Test
    void shouldInitializeReputationWhenNotExists() {
        when(repository.findByMemberId(memberId)).thenReturn(Optional.empty());
        when(repository.save(any(MemberReputation.class))).thenAnswer(inv -> inv.getArgument(0));

        MemberReputation result = reputationService.initReputation(memberId);

        assertNotNull(result);
        assertEquals(memberId, result.getMemberId());
        assertEquals(0, result.getPoints());
        assertEquals(MemberLevel.EXPLORATEUR, result.getLevel());
        verify(repository, times(1)).findByMemberId(memberId);
        verify(repository, times(1)).save(any(MemberReputation.class));
    }

    @Test
    void shouldReturnExistingReputationWhenInitCalled() {
        MemberReputation existing = MemberReputation.builder()
                .memberId(memberId)
                .points(100)
                .level(MemberLevel.CONTRIBUTEUR)
                .build();
        when(repository.findByMemberId(memberId)).thenReturn(Optional.of(existing));

        MemberReputation result = reputationService.initReputation(memberId);

        assertEquals(existing, result);
        verify(repository, times(1)).findByMemberId(memberId);
        verify(repository, never()).save(any(MemberReputation.class));
    }

    @Test
    void shouldAddPointsAndIncrementCountersAndRecalculateLevel() {
        MemberReputation existing = MemberReputation.builder()
                .memberId(memberId)
                .points(90)
                .level(MemberLevel.EXPLORATEUR)
                .postsCount(1)
                .badges(new ArrayList<>())
                .build();

        when(repository.findByMemberId(memberId)).thenReturn(Optional.of(existing));
        when(repository.save(any(MemberReputation.class))).thenAnswer(inv -> inv.getArgument(0));

        // Adding POST_CREATED gives 5 points. Total points will be 95 (still EXPLORATEUR)
        MemberReputation result = reputationService.addPoints(memberId, ReputationAction.POST_CREATED);

        assertEquals(95, result.getPoints());
        assertEquals(2, result.getPostsCount());
        assertEquals(MemberLevel.EXPLORATEUR, result.getLevel());

        // Now adding another POST_CREATED to reach 100 points, level should upgrade to CONTRIBUTEUR
        MemberReputation result2 = reputationService.addPoints(memberId, ReputationAction.POST_CREATED);
        assertEquals(100, result2.getPoints());
        assertEquals(3, result2.getPostsCount());
        assertEquals(MemberLevel.CONTRIBUTEUR, result2.getLevel());

        verify(repository, times(2)).save(any(MemberReputation.class));
    }

    @Test
    void shouldAwardRisingStarBadgeWhenPointsAreHigh() {
        MemberReputation existing = MemberReputation.builder()
                .memberId(memberId)
                .points(490)
                .level(MemberLevel.EXPERT)
                .badges(new ArrayList<>())
                .build();

        when(repository.findByMemberId(memberId)).thenReturn(Optional.of(existing));
        when(repository.save(any(MemberReputation.class))).thenAnswer(inv -> inv.getArgument(0));

        // Group created action gives 10 points. New total 500, which awards "Rising Star"
        MemberReputation result = reputationService.addPoints(memberId, ReputationAction.GROUP_CREATED);

        assertEquals(500, result.getPoints());
        assertTrue(result.getBadges().contains("Rising Star"));
        verify(repository, times(1)).save(any(MemberReputation.class));
    }
}
