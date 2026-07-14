package mx.gob.sedif.inventarios.security;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "tbl_refresh_token_blacklist")
public class RefreshTokenBlacklistEntry {

    @Id
    @Column(name = "token_hash", length = 64)
    private String tokenHash;

    @Column(name = "revoked_at", nullable = false)
    private LocalDateTime revokedAt;
}
