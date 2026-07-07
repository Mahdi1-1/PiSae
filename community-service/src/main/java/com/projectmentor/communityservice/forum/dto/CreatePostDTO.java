package com.projectmentor.communityservice.forum.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Data
public class CreatePostDTO {

    @NotBlank
    private String title;

    @NotBlank
    private String content;
    private String groupId;
    private String authorId;


    private List<String> tags;

    private String sector;

    private List<String> mediaUrls;

}