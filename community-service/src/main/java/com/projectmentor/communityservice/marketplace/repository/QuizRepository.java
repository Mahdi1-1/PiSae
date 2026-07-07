package com.projectmentor.communityservice.marketplace.repository;

import com.projectmentor.communityservice.marketplace.model.Quiz;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface QuizRepository extends MongoRepository<Quiz, String> {
    Optional<Quiz> findByApplicationId(String applicationId);
}
