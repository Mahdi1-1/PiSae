package com.projectmentor.communityservice.network.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class UserDiscoveryResponse {
    private String id;
    private String name;
    private String prenom;
    private String email;
    private String role;
    private String sector;
    private String bio;
    private List<String> skills;
    private String location;
    private boolean isConnected;
    private boolean hasPendingRequest;
}
