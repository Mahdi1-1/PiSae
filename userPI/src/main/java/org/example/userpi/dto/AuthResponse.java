package org.example.userpi.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.example.userpi.Enum.Role;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private int id;
    private String email;
    private Role role;
}