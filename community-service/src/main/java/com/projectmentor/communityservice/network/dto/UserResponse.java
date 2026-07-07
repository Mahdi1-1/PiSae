package com.projectmentor.communityservice.network.dto;

import lombok.Data;

@Data
public class UserResponse {
    private Long id;
    private String email;
    private String name;
    private String prenom;
    private String role;
    private String statut;
    private String dateInscription;
}
