package mx.gob.sedif.inventarios.security;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.HexFormat;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class RefreshTokenBlacklist {

    private static final int TOKEN_RETENTION_DAYS = 7;

    private final RefreshTokenBlacklistRepository blacklistRepository;

    @Transactional
    public void revoke(String token) {
        RefreshTokenBlacklistEntry entry = new RefreshTokenBlacklistEntry();
        entry.setTokenHash(hash(token));
        entry.setRevokedAt(LocalDateTime.now());
        blacklistRepository.save(entry);
    }

    public boolean isRevoked(String token) {
        return blacklistRepository.existsByTokenHash(hash(token));
    }

    @Scheduled(cron = "0 0 3 * * *")
    @Transactional
    public void limpiarTokensExpirados() {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(TOKEN_RETENTION_DAYS);
        blacklistRepository.deleteByRevokedAtBefore(cutoff);
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
