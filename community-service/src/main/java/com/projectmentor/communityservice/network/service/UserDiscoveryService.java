package com.projectmentor.communityservice.network.service;

import com.projectmentor.communityservice.network.dto.UserDiscoveryResponse;
import com.projectmentor.communityservice.network.dto.UserResponse;
import com.projectmentor.communityservice.network.model.ConnectionStatus;
import com.projectmentor.communityservice.network.repository.ConnectionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserDiscoveryService {

    private final ConnectionRepository connectionRepository;
    private final UserService userService;

    /**
     * Discover users based on search criteria
     * This is a mock implementation - in production, this would query a user service
     */
    public List<UserDiscoveryResponse> discoverUsers(String query, String currentUserId) {
        log.info("Discovering users with query: {} for user: {}", query, currentUserId);
        
        // Mock user data - in production, this would come from user service
        List<UserDiscoveryResponse> allUsers = getMockUsers();
        
        // Filter out current user
        List<UserDiscoveryResponse> otherUsers = allUsers.stream()
                .filter(user -> !user.getId().equals(currentUserId))
                .collect(Collectors.toList());
        
        // Apply search filter
        if (query != null && !query.trim().isEmpty()) {
            String searchQuery = query.toLowerCase();
            otherUsers = otherUsers.stream()
                    .filter(user -> 
                        user.getName().toLowerCase().contains(searchQuery) ||
                        user.getPrenom().toLowerCase().contains(searchQuery) ||
                        user.getRole().toLowerCase().contains(searchQuery) ||
                        user.getSector().toLowerCase().contains(searchQuery) ||
                        user.getSkills().stream().anyMatch(skill -> skill.toLowerCase().contains(searchQuery))
                    )
                    .collect(Collectors.toList());
        }
        
        // Mark connection status
        return otherUsers.stream()
                .map(user -> {
                    user.setConnected(isConnected(currentUserId, user.getId()));
                    user.setHasPendingRequest(hasPendingRequest(currentUserId, user.getId()));
                    return user;
                })
                .collect(Collectors.toList());
    }

    /**
     * Get recommended users for networking
     * Based on shared sector, skills, or similar roles
     */
    public List<UserDiscoveryResponse> getRecommendedUsers(String currentUserId) {
        List<UserDiscoveryResponse> allUsers = getMockUsers();
        
        // Remove current user and already connected users
        return allUsers.stream()
                .filter(user -> !user.getId().equals(currentUserId))
                .filter(user -> !isConnected(currentUserId, user.getId()))
                .filter(user -> !hasPendingRequest(currentUserId, user.getId()))
                .limit(5) // Return top 5 recommendations
                .collect(Collectors.toList());
    }

    private boolean isConnected(String userId1, String userId2) {
        return connectionRepository.findByRequesterIdAndTargetIdAndStatus(userId1, userId2, ConnectionStatus.ACCEPTED).isPresent() ||
               connectionRepository.findByRequesterIdAndTargetIdAndStatus(userId2, userId1, ConnectionStatus.ACCEPTED).isPresent();
    }

    private boolean hasPendingRequest(String requesterId, String targetId) {
        return connectionRepository.findByRequesterIdAndTargetIdAndStatus(requesterId, targetId, ConnectionStatus.PENDING).isPresent();
    }

    /**
     * Get users from user service API
     */
    private List<UserDiscoveryResponse> getMockUsers() {
        try {
            // Try to get real users from MySQL database via user service
            List<UserResponse> realUsers = userService.getAllUsers();
            return realUsers.stream()
                    .map(user -> UserDiscoveryResponse.builder()
                            .id(user.getId().toString())
                            .name(user.getName())
                            .prenom(user.getPrenom())
                            .email(user.getEmail())
                            .role(user.getRole())
                            .sector("Technology") // Default sector
                            .bio("Utilisateur de la plateforme")
                            .skills(Arrays.asList("Communication", "Collaboration"))
                            .location("Tunisia")
                            .build())
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.warn("Failed to fetch real users, falling back to mock data: {}", e.getMessage());
            // Fallback to mock data if user service is unavailable
            return getFallbackMockUsers();
        }
    }

    /**
     * Fallback mock data when user service is unavailable
     */
    private List<UserDiscoveryResponse> getFallbackMockUsers() {
        return Arrays.asList(
            UserDiscoveryResponse.builder()
                .id("1")
                .name("Ali")
                .prenom("Ben")
                .email("ali.ben@example.com")
                .role("ENTREPRENEUR")
                .sector("FinTech")
                .bio("Fondateur de startup FinTech spécialisée dans les paiements mobiles")
                .skills(Arrays.asList("Blockchain", "Finance", "Management", "Strategy"))
                .location("Tunis")
                .build(),
                
            UserDiscoveryResponse.builder()
                .id("2")
                .name("Sarah")
                .prenom("Tounsi")
                .email("sarah.tounsi@example.com")
                .role("DEVELOPER")
                .sector("EdTech")
                .bio("Développeuse Full Stack passionnée par l'éducation numérique")
                .skills(Arrays.asList("React", "Node.js", "MongoDB", "Angular", "Python"))
                .location("Sfax")
                .build(),
                
            UserDiscoveryResponse.builder()
                .id("3")
                .name("Mohamed")
                .prenom("Khalil")
                .email("mohamed.khalil@example.com")
                .role("MENTOR")
                .sector("HealthTech")
                .bio("Mentor expert en IA appliquée à la santé")
                .skills(Arrays.asList("Machine Learning", "Data Science", "Python", "TensorFlow"))
                .location("Paris")
                .build(),
                
            UserDiscoveryResponse.builder()
                .id("4")
                .name("Leila")
                .prenom("Hammami")
                .email("leila.hammami@example.com")
                .role("PARTNER")
                .sector("GreenTech")
                .bio("Partenaire stratégique dans les énergies renouvelables")
                .skills(Arrays.asList("Business Development", "Partnerships", "Sustainability", "Project Management"))
                .location("Marsa")
                .build(),
                
            UserDiscoveryResponse.builder()
                .id("5")
                .name("Karim")
                .prenom("Trabelsi")
                .email("karim.trabelsi@example.com")
                .role("INVESTOR")
                .sector("FinTech")
                .bio("Investisseur spécialisé dans les startups technologiques")
                .skills(Arrays.asList("Investment", "Due Diligence", "Finance", "Strategy"))
                .location("Dubai")
                .build(),
                
            UserDiscoveryResponse.builder()
                .id("6")
                .name("Nour")
                .prenom("Bensalah")
                .email("nour.bensalah@example.com")
                .role("DEVELOPER")
                .sector("AgriTech")
                .bio("Développeuse spécialisée en solutions agricoles intelligentes")
                .skills(Arrays.asList("IoT", "Arduino", "Python", "Data Analytics", "Mobile Development"))
                .location("Monastir")
                .build()
        );
    }
}
