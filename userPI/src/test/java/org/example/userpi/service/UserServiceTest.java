package org.example.userpi.service;

import org.example.userpi.Enum.Role;
import org.example.userpi.dto.AdminCreateUserRequest;
import org.example.userpi.model.User;
import org.example.userpi.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserServiceImpl userService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = new User();
        sampleUser.setId(1);
        sampleUser.setEmail("test@example.com");
        sampleUser.setRole(Role.USER);
    }

    @Test
    void shouldReturnUserWhenIdExists() {
        when(userRepository.findById(1)).thenReturn(Optional.of(sampleUser));

        User result = userService.getUserById(1);

        assertEquals("test@example.com", result.getEmail());
        verify(userRepository, times(1)).findById(1);
    }

    @Test
    void shouldThrowExceptionWhenUserNotFound() {
        when(userRepository.findById(99)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> userService.getUserById(99));
    }

    @Test
    void shouldEncodePasswordWhenAddingUser() {
        User newUser = new User();
        newUser.setEmail("new@example.com");
        newUser.setPassword("plainPassword");

        when(passwordEncoder.encode("plainPassword")).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        User result = userService.addUser(newUser);

        assertEquals("encodedPassword", result.getPassword());
        verify(userRepository, times(1)).save(newUser);
    }

    @Test
    void shouldThrowExceptionWhenCreatingUserWithExistingEmail() {
        AdminCreateUserRequest request = new AdminCreateUserRequest();
        request.setName("Someone");
        request.setPrenom("New");
        request.setEmail("test@example.com");
        request.setPassword("Password123");
        request.setRole(Role.MENTOR);

        when(userRepository.existsByEmail("test@example.com")).thenReturn(true);

        assertThrows(RuntimeException.class, () -> userService.createUser(request));
        verify(userRepository, never()).save(any(User.class));
    }
}
