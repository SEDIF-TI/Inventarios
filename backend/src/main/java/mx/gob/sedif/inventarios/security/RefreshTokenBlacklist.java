package mx.gob.sedif.inventarios.security;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.util.HexFormat;

import org.springframework.stereotype.Component;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;

@Component
public class RefreshTokenBlacklist {

    private final Cache<String, Boolean> revoked = Caffeine.newBuilder()
        .maximumSize(10_000)
        .expireAfterWrite(Duration.ofDays(7))
        .build();

    public void revoke(String token) {
        revoked.put(hash(token), true);
    }

    public boolean isRevoked(String token) {
        return revoked.getIfPresent(hash(token)) != null;
    }

    private String hash(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 no disponible", e);
        }
    }
}
