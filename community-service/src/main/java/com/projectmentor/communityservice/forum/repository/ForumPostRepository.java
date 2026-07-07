package com.projectmentor.communityservice.forum.repository;

import com.projectmentor.communityservice.forum.model.ForumPost;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.core.query.TextCriteria;

import java.util.List;

public interface ForumPostRepository extends MongoRepository<ForumPost, String> {

    List<ForumPost> findBySector(String sector);

    Page<ForumPost> findAll(Pageable pageable);  // nouveau

    Page<ForumPost> findBySector(String sector, Pageable pageable); // nouveau
    List<ForumPost> findAllBy(TextCriteria criteria);

    List<ForumPost> findByGroupId(String groupId);

    Page<ForumPost> findByGroupId(String groupId, Pageable pageable);
}