package mx.gob.sedif.inventarios.security;

import java.util.Date;
import java.util.stream.Collectors;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class JwtTokenProvider {
    private final SecretKey key;
    private final long accessValidityMs;
    private final long refreshValidityMs;

    public JwtTokenProvider(
        @Value("${app.jwt.secret}") String secretKey,
        @Value("${app.jwt.expiration-ms}") long accessValidityMs,
        @Value("${app.jwt.refresh-expiration-ms}") long refreshValidityMs
    ) {
        if (secretKey == null || secretKey.isBlank()) {
            throw new IllegalArgumentException("JWT_SECRET no puede estar vacío");
        }
        if (secretKey.getBytes().length < 32) {
            throw new IllegalArgumentException(
                "JWT_SECRET debe tener al menos 32 bytes (256 bits). Longitud actual: "
                + secretKey.getBytes().length + " bytes");
        }
        this.key = Keys.hmacShaKeyFor(secretKey.getBytes());
        this.accessValidityMs = accessValidityMs;
        this.refreshValidityMs = refreshValidityMs;
    }

    public String createToken(Authentication authentication) {
        String username = authentication.getName();
        Date now = new Date();
        Date validity = new Date(now.getTime() + accessValidityMs);
        String roles = authentication.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority)
            .collect(Collectors.joining(","));

        return Jwts.builder()
            .subject(username)
            .issuedAt(now)
            .claim("roles", roles)
            .expiration(validity)
            .signWith(key)
            .compact(); 
    }

    public String getUsernameFromToken(String token) {
        Claims claims = Jwts.parser()
            .verifyWith(key)
            .build()
            .parseSignedClaims(token)
            .getPayload();
        return claims.getSubject();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser().verifyWith(key).build().parseSignedClaims(token);
            return true;
        } catch (Exception e){
            log.debug("Token inválido o expirado: {}", e.getMessage());
            return false;
        }
    }

    public String createRefreshToken(String username) {
        Date now = new Date();
        return Jwts.builder()
            .subject(username)
            .issuedAt(now)
            .expiration(new Date(now.getTime() + refreshValidityMs))
            .signWith(key)
            .compact();
    }
}
