package org.example.userpi.service;

import lombok.RequiredArgsConstructor;
import org.example.userpi.config.JwtService;
import org.example.userpi.dto.AuthRequest;
import org.example.userpi.dto.AuthResponse;
import org.example.userpi.dto.RegisterRequest;
import org.example.userpi.model.User;
import org.example.userpi.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import org.example.userpi.Enum.Role;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        User user = new User();
        user.setName(request.getName());
        user.setPrenom(request.getPrenom());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setDateInscription(LocalDate.now());
        user.setStatut("active");
        user.setRole(request.getRole() != null ? request.getRole() : Role.USER);

        // ✅ Récupère l'objet sauvegardé avec l'id généré
        System.out.println("Register role reçu: " + request.getRole());
        User saved = userRepository.save(user);
        System.out.println("Role sauvegardé: " + saved.getRole());
        return new AuthResponse(
                jwtService.generateToken(saved),  // ✅ utilise saved, pas user
                saved.getId(),
                saved.getEmail(),
                saved.getRole()
        );
    }


    public AuthResponse login(AuthRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("No account found with this email"));

        if (user.getPassword() == null) {
            throw new RuntimeException("This account uses Google login. Please login with Google.");
        }

        if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
            throw new RuntimeException("Password cannot be empty");
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(), request.getPassword()
                    )
            );
        } catch (BadCredentialsException e) {
            throw new RuntimeException("Incorrect password");
        }

        return new AuthResponse(
                jwtService.generateToken(user),
                user.getId(),
                user.getEmail(),
                user.getRole()
        );
    }

}