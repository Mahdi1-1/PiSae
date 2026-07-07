package com.projectmentor.communityservice.network.controller;

import com.projectmentor.communityservice.network.dto.UserResponse;
import com.projectmentor.communityservice.network.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/community/users")
@RequiredArgsConstructor
public class UserDirectoryController {

    private final UserService userService;

    @GetMapping("/directory")
    public List<UserResponse> getUserDirectory() {
        return userService.getAllUsers();
    }

    @GetMapping("/{userId}")
    public UserResponse getUser(@PathVariable Long userId) {
        return userService.getUserById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
    }
}
