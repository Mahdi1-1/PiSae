package org.example.userpi.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Public directory fields for networking (no password or sensitive data).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDirectoryDto {
    private int id;
    private String name;
    private String prenom;
    private String email;
    private String role;
}
