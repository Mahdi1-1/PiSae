package com.projectmentor.communityservice.network.service;

import com.projectmentor.communityservice.network.dto.UserResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final RestTemplate restTemplate;

    @Value("${user.service.url:http://localhost:8081/api/users}")
    private String userServiceUrl;

    public Optional<UserResponse> getUserById(Long userId) {
        try {
            // Use public directory endpoint instead of /api/users/{id} which requires auth
            String url = userServiceUrl + "/directory";
            UserResponse[] users = restTemplate.getForObject(url, UserResponse[].class);
            if (users != null) {
                return Arrays.stream(users)
                        .filter(u -> u.getId() == userId.intValue())
                        .findFirst();
            }
            return Optional.empty();
        } catch (Exception e) {
            log.error("Error fetching user {}: {}", userId, e.getMessage());
            return Optional.empty();
        }
    }

    public List<UserResponse> getAllUsers() {
        try {
            String url = userServiceUrl + "/directory";
            UserResponse[] users = restTemplate.getForObject(url, UserResponse[].class);
            return users != null ? Arrays.asList(users) : List.of();
        } catch (Exception e) {
            log.error("Error fetching all users: {}", e.getMessage());
            return List.of();
        }
    }

    public String getUserName(Long userId) {
        return getUserById(userId)
                .map(user -> user.getName() + " " + user.getPrenom())
                .orElse("Utilisateur " + userId);
    }
}
