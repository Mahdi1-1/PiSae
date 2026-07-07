package com.projectmentor.communityservice.marketplace.dto;

import lombok.Builder;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
@Builder
public class ApplyDTO {

    private String candidateId;

    private String cvUrl;
    
    private MultipartFile cvFile;

    private String coverLetter;
}