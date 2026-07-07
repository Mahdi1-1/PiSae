package org.example.apigateway.filter;

import org.example.apigateway.security.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.function.HandlerFilterFunction;
import org.springframework.web.servlet.function.ServerRequest;
import org.springframework.web.servlet.function.ServerResponse;

import java.util.List;

@Component
public class AuthFilter {

    private final JwtUtil jwtUtil;

    public AuthFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    private static final List<String> PUBLIC_PATHS = List.of(
            "/api/auth/register",
            "/api/auth/login",
            "/api/auth/forgot-password",
            "/api/auth/reset-password",
            "/oauth2/authorization/google",
            "/login/oauth2/code/google",
            "/api/community/marketplace/files",
            "/verify"   // covers /api/tickets/{id}/verify and /api/verify/**
    );

    private boolean isPublicPath(String path) {
        return PUBLIC_PATHS.stream().anyMatch(path::startsWith);
    }

    public HandlerFilterFunction<ServerResponse, ServerResponse> jwtFilter() {
        return (request, next) -> {
            String path = request.uri().getPath();
            String method = request.method().name();

            System.out.println("Gateway checking path: '" + path + "' | method: " + method);

            // Let CorsFilter handle OPTIONS – forward without token check
            if ("OPTIONS".equals(method)) {
                return next.handle(request);
            }

            if (isPublicPath(path)) {
                System.out.println(">>> PUBLIC PATH MATCHED: " + path + " — forwarding without token");
                return next.handle(request);
            } else {
                System.out.println(">>> SECURE PATH: " + path + " — checking token");
            }

            String authHeader = request.headers().firstHeader("Authorization");

            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                System.out.println("No token — rejecting");
                return ServerResponse.status(HttpStatus.UNAUTHORIZED)
                        .body("Missing or invalid Authorization header");
            }

            String token = authHeader.substring(7);

            if (!jwtUtil.isTokenValid(token)) {
                System.out.println("Invalid token — rejecting");
                return ServerResponse.status(HttpStatus.UNAUTHORIZED)
                        .body("Invalid or expired token");
            }

            String email = jwtUtil.extractEmail(token);
            String role = jwtUtil.extractRole(token);
            String userId = jwtUtil.extractUserId(token);

            System.out.println("Valid token for: " + email
                    + " role: " + role
                    + " userId: " + userId);

            // Use h.set(...) (replaces) instead of .header(...) (appends).
            // Otherwise client-sent X-User-* headers get duplicated, e.g. "6,6",
            // and Integer.parseInt fails on the downstream service.
            final String roleHeader = role != null ? role : "ROLE_USER";
            ServerRequest modifiedRequest = ServerRequest.from(request)
                    .headers(h -> {
                        h.set("X-User-Email", email);
                        h.set("X-User-Role", roleHeader);
                        h.set("X-User-Id", userId);
                    })
                    .build();

            return next.handle(modifiedRequest);
        };
    }
}