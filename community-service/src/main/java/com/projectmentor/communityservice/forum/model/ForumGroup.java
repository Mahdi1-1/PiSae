package com.projectmentor.communityservice.forum.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "forum_groups")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ForumGroup {

    @Id
    private String id;

    private String name;           // ex: "FinTech Tunisia"

    private String sector;         // ex: "FinTech"

    private String description;

    private GroupVisibility visibility;

    private String createdBy;      // userId du créateur

    @Builder.Default
    private List<String> adminIds = new ArrayList<>();

    @Builder.Default
    private List<String> memberIds = new ArrayList<>();

    private int memberCount;

    private GroupStatus status;

    private LocalDateTime createdAt;
}