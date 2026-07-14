CREATE TABLE tbl_refresh_token_blacklist (
    token_hash VARCHAR(64) PRIMARY KEY,
    revoked_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_refresh_token_blacklist_revoked_at
    ON tbl_refresh_token_blacklist (revoked_at);
