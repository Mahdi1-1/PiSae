package org.example.userpi.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.example.userpi.dto.ForgotPasswordRequest;
import org.example.userpi.dto.ResetPasswordRequest;
import org.example.userpi.model.PasswordResetToken;
import org.example.userpi.model.User;
import org.example.userpi.repository.PasswordResetTokenRepository;
import org.example.userpi.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        // check if user exists
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("No user found with email: " + request.getEmail()));

        // delete any existing token for this email
        tokenRepository.deleteByEmail(request.getEmail());

        // generate random token
        String token = UUID.randomUUID().toString();

        // save token in DB with 30 min expiry
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setToken(token);
        resetToken.setEmail(request.getEmail());
        resetToken.setExpiryDate(LocalDateTime.now().plusMinutes(30));
        tokenRepository.save(resetToken);

        // send email with reset link
        emailService.sendResetPasswordEmail(request.getEmail(), token);
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        // find token in DB
        PasswordResetToken resetToken = tokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new RuntimeException("Invalid token"));

        // check token not expired
        if (resetToken.isExpired()) {
            tokenRepository.delete(resetToken);
            throw new RuntimeException("Token has expired — please request a new one");
        }

        // find user and update password
        User user = userRepository.findByEmail(resetToken.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // delete token — it's used, no longer needed
        tokenRepository.delete(resetToken);
    }
}