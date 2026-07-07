package com.projectmentor.communityservice.reputation.controller;

import com.projectmentor.communityservice.reputation.model.MemberReputation;
import com.projectmentor.communityservice.reputation.model.ReputationAction;
import com.projectmentor.communityservice.reputation.service.ReputationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/community/reputation")
@RequiredArgsConstructor
public class ReputationController {

    private final ReputationService reputationService;

    // initialiser réputation d'un membre
    @PostMapping("/init/{memberId}")
    public MemberReputation initReputation(@PathVariable String memberId) {
        return reputationService.initReputation(memberId);
    }

    // récupérer réputation d'un membre
    @GetMapping("/{memberId}")
    public MemberReputation getReputation(@PathVariable String memberId) {
        return reputationService.getReputation(memberId);
    }

    // ajouter points manuellement (pour tests)
    // en production ce sera appelé automatiquement par les autres services
    @PutMapping("/{memberId}/points")
    public MemberReputation addPoints(
            @PathVariable String memberId,
            @RequestParam ReputationAction action) {
        return reputationService.addPoints(memberId, action);
    }

    // leaderboard top 10
    @GetMapping("/leaderboard")
    public List<MemberReputation> getLeaderboard() {
        return reputationService.getLeaderboard();
    }
}