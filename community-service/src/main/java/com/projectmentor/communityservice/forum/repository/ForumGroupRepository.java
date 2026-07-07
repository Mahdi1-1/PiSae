package com.projectmentor.communityservice.forum.repository;

import com.projectmentor.communityservice.forum.model.ForumGroup;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ForumGroupRepository extends MongoRepository<ForumGroup, String> {

    List<ForumGroup> findBySector(String sector);

    List<ForumGroup> findByVisibility(String visibility);
}