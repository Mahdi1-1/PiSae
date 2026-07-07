package org.example.userpi.service;

import org.example.userpi.dto.AdminCreateUserRequest;
import org.example.userpi.dto.ChangePasswordRequest;
import org.example.userpi.dto.ExpertSummaryDto;
import org.example.userpi.model.User;
import java.util.List;

public interface UserService {
    List<User> getAllUsers();
    User getUserById(int id);
    User updateUser(User user, int requestingUserId);
    User addUser(User user);
    // ADMIN only — create a user with a specific role
    User createUser(AdminCreateUserRequest request);
    void deleteUser(int id);
    void setPassword(int id, String password, int requestingUserId);
    void changePassword(int id, ChangePasswordRequest request, int requestingUserId);
    List<ExpertSummaryDto> getExperts(); // ajout zaineb
}