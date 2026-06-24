package mx.gob.sedif.inventarios.security.auth;

public record JwtResponse(String token, UserInfoDTO userInfo) {}
