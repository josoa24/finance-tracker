package com.finance.finance_tracker.auth;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Base64;
import java.util.Date;

@Component
public class JwtUtil {

    private final Key key;
    private final long expirationMs;

    public JwtUtil(@Value("${jwt.secret:thisIsASecureJWTSecretKeyWith256BitsOfEntropy1234567890123456}") String secret,
                   @Value("${jwt.expiration-ms:86400000}") long expirationMs) {
        // Ensure the secret is at least 32 bytes (256 bits) for HS256
        byte[] secretBytes = secret.getBytes(StandardCharsets.UTF_8);
        
        // If the secret is too short, pad it or try to decode as Base64
        if (secretBytes.length < 32) {
            // Try to decode as Base64 first, if provided as Base64-encoded secret
            try {
                secretBytes = Base64.getDecoder().decode(secret);
            } catch (IllegalArgumentException e) {
                // Not valid Base64, use as-is but pad if necessary
                StringBuilder paddedSecret = new StringBuilder(secret);
                while (paddedSecret.length() < 32) {
                    paddedSecret.append("0");
                }
                secretBytes = paddedSecret.toString().getBytes(StandardCharsets.UTF_8);
            }
        }
        
        this.key = Keys.hmacShaKeyFor(secretBytes);
        this.expirationMs = expirationMs;
    }

    public String generateToken(String username) {
        Date now = new Date();
        Date exp = new Date(now.getTime() + expirationMs);
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(now)
                .setExpiration(exp)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public String getUsernameFromToken(String token) {
        return Jwts.parserBuilder().setSigningKey(key).build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException ex) {
            return false;
        }
    }
}
