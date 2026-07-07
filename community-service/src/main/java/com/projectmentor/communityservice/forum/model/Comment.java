package com.projectmentor.communityservice.forum.model;

import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Comment {

    private String authorId;
    private String authorName;
    private String content;
    private LocalDateTime createdAt;

    @Builder.Default
    private List<Comment> replies = new ArrayList<>();

}