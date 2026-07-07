package org.example.userpi.service;

import lombok.RequiredArgsConstructor;
import org.example.userpi.Enum.Role;
import org.example.userpi.dto.AdminCreateUserRequest;
import org.example.userpi.dto.ChangePasswordRequest;
import org.example.userpi.dto.ExpertSummaryDto;
import org.example.userpi.model.User;
import org.example.userpi.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public User getUserById(int id) {
        return userRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("User not found with id: " + id));
    }

    @Override
    public User updateUser(User user, int requestingUserId) {
        User existing = userRepository.findById(user.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        User requester = userRepository.findById(requestingUserId)
                .orElseThrow(() -> new RuntimeException("Requesting user not found"));

        boolean isAdmin = requester.getRole() == Role.ADMIN;

        // Non-admins can only edit themselves
        if (!isAdmin && existing.getId() != requestingUserId) {
            throw new RuntimeException("You can only update your own data");
        }

        existing.setName(user.getName());
        existing.setPrenom(user.getPrenom());
        existing.setStatut(user.getStatut());

        // Only admins can change the role
        if (isAdmin) {
            existing.setRole(user.getRole());
        }

        if (!existing.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(user.getEmail())) {
                throw new RuntimeException("Email already in use");
            }
            existing.setEmail(user.getEmail());
        }

        return userRepository.save(existing);
    }

    @Override
    public User addUser(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    // ── ADMIN: create a user with a specific role ──────────────────────────────
    @Override
    public User createUser(AdminCreateUserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already in use");
        }

        User user = new User();
        user.setName(request.getName());
        user.setPrenom(request.getPrenom());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setDateInscription(LocalDate.now());
        user.setStatut("active");
        user.setRole(request.getRole());   // ← admin chooses the role

        return userRepository.save(user);
    }

    @Override
    public void deleteUser(int id) {
        userRepository.deleteById(id);
    }

    @Override
    public void setPassword(int id, String password, int requestingUserId) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getId() != requestingUserId) {
            throw new RuntimeException("You can only set your own password");
        }

        if (user.getPassword() != null) {
            throw new RuntimeException("Password already set. Use change-password instead.");
        }

        user.setPassword(passwordEncoder.encode(password));
        userRepository.save(user);
    }

    @Override
    public void changePassword(int id, ChangePasswordRequest request, int requestingUserId) {
        User existing = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        if (existing.getId() != requestingUserId) {
            throw new RuntimeException("You can only change your own password");
        }

        if (!passwordEncoder.matches(request.getOldPassword(), existing.getPassword())) {
            throw new RuntimeException("Old password is incorrect");
        }

        existing.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(existing);
    }
    @Override
    public List<ExpertSummaryDto> getExperts() {
        return userRepository.findByRole(Role.EXPERT)
                .stream()
                .map(u -> new ExpertSummaryDto(
                        u.getId(),
                        u.getName() + " " + u.getPrenom(),
                        u.getEmail()
                ))
                .toList();
    } //zaineb
}