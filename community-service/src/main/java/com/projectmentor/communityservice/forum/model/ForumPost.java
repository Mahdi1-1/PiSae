package com.projectmentor.communityservice.forum.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.TextIndexed;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "forum_posts")

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor

public class ForumPost {

    @Id
    private String id;

    private String groupId;
    private String groupName;
    private String authorId;
    private String authorName;

    private String parentPostId;
    @TextIndexed
    private String title;
    @TextIndexed
    private String content;

    private List<String> tags;

    private String sector;

    private PostStatus status;

    private int viewsCount;

    private int likesCount;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @Builder.Default
    private List<Comment> comments = new ArrayList<>();
    @Builder.Default
    private List<String> likedBy = new ArrayList<>();

    @Builder.Default
    private List<String> mediaUrls = new ArrayList<>();
}
