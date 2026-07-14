package mx.gob.sedif.inventarios.security;

import java.time.LocalDateTime;

import org.springframework.data.jpa.repository.JpaRepository;

public interface RefreshTokenBlacklistRepository extends JpaRepository<RefreshTokenBlacklistEntry, String> {

    boolean existsByTokenHash(String tokenHash);

    void deleteByRevokedAtBefore(LocalDateTime cutoff);
}
