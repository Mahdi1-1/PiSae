package com.projectmentor.communityservice.forum.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateGroupDTO {

    @NotBlank
    private String name;

    @NotBlank
    private String sector;

    private String description;

    private String createdBy;

    private String visibility;  // PUBLIC / PRIVATE / INVITATION_ONLY
}