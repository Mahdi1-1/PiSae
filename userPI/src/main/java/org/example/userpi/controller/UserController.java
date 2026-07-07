package org.example.userpi.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.userpi.dto.AdminCreateUserRequest;
import org.example.userpi.dto.ChangePasswordRequest;
import org.example.userpi.dto.ExpertSummaryDto;
import org.example.userpi.dto.SetPasswordRequest;
import org.example.userpi.model.User;
import org.example.userpi.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // ADMIN only — get all users
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    // Public directory of users
    @GetMapping("/directory")
    public ResponseEntity<List<User>> getUserDirectory() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    // Any logged-in user — get by id
    @GetMapping("/{id:\\d+}")
    public ResponseEntity<User> getUserById(@PathVariable int id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    // ADMIN only — create a user with a chosen role
    // POST /api/users/admin/create
    @PostMapping("/admin/create")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> createUser(
            @Valid @RequestBody AdminCreateUserRequest request) {
        return ResponseEntity.ok(userService.createUser(request));
    }

    // Google user sets their password for the first time
    @PostMapping("/{id}/set-password")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> setPassword(
            @PathVariable int id,
            @RequestBody SetPasswordRequest request,
            @RequestHeader("X-User-Id") int requestingUserId) {
        userService.setPassword(id, request.getPassword(), requestingUserId);
        return ResponseEntity.ok("Password set successfully");
    }

    // Own data only — update profile
    @PutMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<User> updateUser(
            @RequestBody User user,
            @RequestHeader("X-User-Id") int requestingUserId) {
        return ResponseEntity.ok(userService.updateUser(user, requestingUserId));
    }

    // Own data only — change password
    @PutMapping("/{id}/change-password")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> changePassword(
            @PathVariable int id,
            @RequestBody ChangePasswordRequest request,
            @RequestHeader("X-User-Id") int requestingUserId) {
        userService.changePassword(id, request, requestingUserId);
        return ResponseEntity.noContent().build();
    }

    // ADMIN only — delete user
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable int id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/experts")
    public ResponseEntity<List<ExpertSummaryDto>> getExperts() {
        return ResponseEntity.ok(userService.getExperts());
    }
}