package com.projectmentor.communityservice.reputation.repository;

import com.projectmentor.communityservice.reputation.model.MemberReputation;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface ReputationRepository extends MongoRepository<MemberReputation, String> {

    Optional<MemberReputation> findByMemberId(String memberId);

    List<MemberReputation> findTop10ByOrderByPointsDesc();

    List<MemberReputation> findTop10ByOrderByGlobalScoreDesc();
}