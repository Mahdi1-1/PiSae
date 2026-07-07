package com.projectmentor.communityservice.marketplace.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class CreateOpportunityDTO {

    @NotBlank
    private String title;

    @NotBlank
    private String description;

    private String publisherId;

    private String type;           // EMPLOI / STAGE / PARTENARIAT / FREELANCE

    private List<String> skillsRequired;

    private String sector;

    private String location;

    private Integer positionsAvailable;

    private LocalDateTime expiresAt;
}