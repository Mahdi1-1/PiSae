package com.projectmentor.communityservice.marketplace.repository;

import com.projectmentor.communityservice.marketplace.model.Opportunity;
import com.projectmentor.communityservice.marketplace.model.OpportunityStatus;
import com.projectmentor.communityservice.marketplace.model.OpportunityType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.time.LocalDateTime;
import java.util.List;

public interface OpportunityRepository extends MongoRepository<Opportunity, String> {

    Page<Opportunity> findByDeletedFalse(Pageable pageable);

    List<Opportunity> findBySectorAndDeletedFalse(String sector);
    Page<Opportunity> findBySectorAndDeletedFalse(String sector, Pageable pageable);

    List<Opportunity> findByTypeAndDeletedFalse(OpportunityType type);
    Page<Opportunity> findByTypeAndDeletedFalse(OpportunityType type, Pageable pageable);

    List<Opportunity> findByPublisherIdAndDeletedFalse(String publisherId);
    Page<Opportunity> findByPublisherIdAndDeletedFalse(String publisherId, Pageable pageable);

    List<Opportunity> findByStatusAndDeletedFalse(OpportunityStatus status);

    // Find OPEN opportunities whose deadline has passed — used by the scheduler
    @Query("{ 'status': 'OPEN', 'deleted': false, 'expiresAt': { $lt: ?0 } }")
    List<Opportunity> findExpiredOpenOpportunities(LocalDateTime now);
}
