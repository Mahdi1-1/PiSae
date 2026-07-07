package org.example.userpi.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.example.userpi.Enum.Role;
import org.example.userpi.model.User;
import org.example.userpi.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDate;

@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler
        implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtService jwtService;

    private static final String FRONTEND_CALLBACK =
            "http://localhost:4200/auth/oauth2-callback";

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication) throws IOException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("given_name");
        String prenom = oAuth2User.getAttribute("family_name");

        User user = userRepository.findByEmail(email)
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setEmail(email);
                    newUser.setName(name != null ? name : "");
                    newUser.setPrenom(prenom != null ? prenom : "");
                    newUser.setPassword(null);
                    newUser.setDateInscription(LocalDate.now());
                    newUser.setStatut("active");
                    newUser.setRole(Role.USER);
                    return userRepository.save(newUser);
                });

        String token = jwtService.generateToken(user);

        // If user registered normally, password exists → no need to set password
        // If user registered via Google, password is null → needs to set password
        boolean needsPassword = user.getPassword() == null;

        response.sendRedirect(FRONTEND_CALLBACK
                + "?token=" + token
                + "&needsPassword=" + needsPassword);
    }
}