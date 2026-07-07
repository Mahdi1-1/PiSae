package org.example.userpi.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.example.userpi.model.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {

    private static final String SECRET_KEY =
            "reEXMMcQqXHkZPobRllQGEtlRatmPlzLFz2YGRSYSsHSQw2CTCUOU83iYT1Iy8TLydNg0OuJOzifTvEHPqo/AxNVh/h12CUKugLxHAvDg0mKjtuvAo4OId3SzJYLxfD0enSimwMtxzkGQtaG12rlB/H+SfaS6FeuEJTPBhYkAsR83+BtNpSXYTYxchDo2CPM3KUd1EGlmRsPjWDENuJ4cfaJnlSTHGWD+J/3ztv7JWWDPiJA5bXroMSVtXc1zEx/rq2eGB/eQqCJq5pWtEgvME8JCsdwP7avL5qvVxmwcFbzO5cEigAbOotwr0ODqsFYuJbZ2Hvek/v3lcQDrqtEtO0lYfJYGGtpKXldI0M9tRM=";

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        return claimsResolver.apply(extractAllClaims(token));
    }

    // main method called from AuthService and OAuth2Handler
    public String generateToken(UserDetails userDetails) {
        Map<String, Object> extraClaims = new HashMap<>();

        // cast to User to get id and role
        if (userDetails instanceof User user) {
            extraClaims.put("userId", user.getId());
            extraClaims.put("role",
                    user.getRole() != null
                            ? "ROLE_" + user.getRole().name()
                            : "ROLE_USER"
            );
        }

        return generateToken(extraClaims, userDetails);
    }

    public String generateToken(Map<String, Object> extraClaims,
                                UserDetails userDetails) {
        return Jwts.builder()
                .claims(extraClaims)
                .subject(userDetails.getUsername())
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis()
                        + 1000 * 60 * 60 * 24))
                .signWith(getSignInKey())
                .compact();
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        return extractUsername(token).equals(userDetails.getUsername())
                && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractClaim(token, Claims::getExpiration)
                .before(new Date());
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSignInKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private SecretKey getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(SECRET_KEY);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}