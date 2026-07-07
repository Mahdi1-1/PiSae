package com.projectmentor.communityservice.forum.controller;

import com.projectmentor.communityservice.forum.dto.CreatePostDTO;
import com.projectmentor.communityservice.forum.model.Comment;
import com.projectmentor.communityservice.forum.model.ForumPost;
import com.projectmentor.communityservice.forum.service.ForumService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

import com.projectmentor.communityservice.marketplace.service.FileStorageService;
import org.springframework.http.MediaType;
import java.io.IOException;

@RestController

@RequestMapping("/api/community/forums")

@RequiredArgsConstructor

public class ForumController {

    private final ForumService forumService;
    private final FileStorageService fileStorageService;

    @PostMapping("/upload")
    public String uploadImage(@RequestParam("file") MultipartFile file) throws IOException {
        return "/api/community/marketplace/files/cv/" + fileStorageService.storeFile(file);
    }

    @PostMapping
    public ForumPost createPost(@RequestBody CreatePostDTO dto) {

        return forumService.createPost(dto);

    }
    @PutMapping("/{postId}")
    public ForumPost updatePost(
            @PathVariable String postId,
            @RequestBody CreatePostDTO dto) {
        return forumService.updatePost(postId, dto);
    }

    @DeleteMapping("/{postId}")
    public void deletePost(@PathVariable String postId) {
        forumService.deletePost(postId);
    }
    @GetMapping
    public List<ForumPost> getAllPosts() {

        return forumService.getAllPosts();

    }

    @PostMapping("/{postId}/comments")
    public ForumPost addComment(
            @PathVariable String postId,
            @RequestBody Comment comment
    ) {
        return forumService.addComment(postId, comment);
    }

    @PostMapping("/{postId}/comments/{commentIndex}/reply")
    public ForumPost addReplyToComment(
            @PathVariable String postId,
            @PathVariable int commentIndex,
            @RequestBody Comment reply
    ) {
        return forumService.addReplyToComment(postId, commentIndex, reply);
    }
    @GetMapping("/paged")
    public Page<ForumPost> getPagedPosts(Pageable pageable) {
        return forumService.getPosts(pageable);
    }

    @GetMapping("/sector/{sector}")
    public Page<ForumPost> getBySector(
            @PathVariable String sector,
            Pageable pageable) {
        return forumService.getPostsBySector(sector, pageable);
    }
    @PutMapping("/{postId}/like")
    public ForumPost likePost(
            @PathVariable String postId,
            @RequestParam String userId) {
        return forumService.likePost(postId, userId);
    }
    @GetMapping("/search")
    public List<ForumPost> searchPosts(@RequestParam String keyword) {
        return forumService.searchPosts(keyword);
    }
    @GetMapping("/group/{groupId}")
    public List<ForumPost> getPostsByGroup(@PathVariable String groupId) {
        return forumService.getPostsByGroup(groupId);
    }

    @GetMapping("/group/{groupId}/paged")
    public Page<ForumPost> getPostsByGroupPaged(
            @PathVariable String groupId,
            Pageable pageable) {
        return forumService.getPostsByGroupPaged(groupId, pageable);
    }
}