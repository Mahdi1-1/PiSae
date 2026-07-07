package org.example.apigateway.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;

@Component
public class JwtUtil {

    private static final String SECRET_KEY =
            "reEXMMcQqXHkZPobRllQGEtlRatmPlzLFz2YGRSYSsHSQw2CTCUOU83iYT1Iy8TLydNg0OuJOzifTvEHPqo/AxNVh/h12CUKugLxHAvDg0mKjtuvAo4OId3SzJYLxfD0enSimwMtxzkGQtaG12rlB/H+SfaS6FeuEJTPBhYkAsR83+BtNpSXYTYxchDo2CPM3KUd1EGlmRsPjWDENuJ4cfaJnlSTHGWD+J/3ztv7JWWDPiJA5bXroMSVtXc1zEx/rq2eGB/eQqCJq5pWtEgvME8JCsdwP7avL5qvVxmwcFbzO5cEigAbOotwr0ODqsFYuJbZ2Hvek/v3lcQDrqtEtO0lYfJYGGtpKXldI0M9tRM=";

    private SecretKey getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(SECRET_KEY);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public boolean isTokenValid(String token) {
        try {
            extractAllClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public String extractEmail(String token) {
        return extractAllClaims(token).getSubject();
    }

    public String extractRole(String token) {
        return extractAllClaims(token).get("role", String.class);
    }

    public String extractUserId(String token) {
        Object userId = extractAllClaims(token).get("userId");
        return String.valueOf(userId);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSignInKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}