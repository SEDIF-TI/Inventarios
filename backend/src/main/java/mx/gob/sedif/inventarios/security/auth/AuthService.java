package mx.gob.sedif.inventarios.security.auth;

import java.util.Arrays;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mx.gob.sedif.inventarios.core.Usuario.Usuario;
import mx.gob.sedif.inventarios.core.Usuario.UsuarioRepository;
import mx.gob.sedif.inventarios.security.JwtTokenProvider;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private static final String REFRESH_COOKIE_NAME = "refreshToken";
    private static final int REFRESH_COOKIE_MAX_AGE = 7 * 24 *60 *60;

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final UsuarioRepository usuarioRepository;
    private final UserDetailsService userDetailsService;

    @Transactional
    public JwtResponse login(LoginRequest request, HttpServletResponse response) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.username(), request.password())
        );
        
        SecurityContextHolder.getContext().setAuthentication(authentication);

        String accessToken = jwtTokenProvider.createToken(authentication);
        String refreshToken = jwtTokenProvider.createRefreshToken(authentication.getName());

        addRefreshCookie(response, refreshToken);

        Usuario usuario = usuarioRepository.findByNombreUsuario(authentication.getName())
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado tras autenticación"));

        UserInfoDTO userInfo = new UserInfoDTO(
            usuario.getNombreUsuario(),
            usuario.getRol().name()
        );

        return new JwtResponse(accessToken, userInfo);
    }

    @Transactional
    public JwtResponse reffreshAccesToken(HttpServletRequest request, HttpServletResponse response) {
        String refreshToken = extractRefreshCookie(request);

        if (refreshToken == null || !jwtTokenProvider.validateToken(refreshToken)) {
            throw new SecurityException("Refresh token inválido o expirado. Inicie sesión nuevamente.");
        }

        String username = jwtTokenProvider.getUsernameFromToken(refreshToken);
        UserDetails userDetails = userDetailsService.loadUserByUsername(username);

        Authentication auth = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

        String newAccessToken = jwtTokenProvider.createToken(auth);
        String newRefreshToken = jwtTokenProvider.createRefreshToken(username);
        addRefreshCookie(response, newRefreshToken);

        Usuario usuario = usuarioRepository.findByNombreUsuario(username)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        UserInfoDTO userInfo = new UserInfoDTO(
            usuario.getNombreUsuario(),
            usuario.getRol().name()
        );

        return new JwtResponse(newAccessToken, userInfo);
    }

    public void logout(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from(REFRESH_COOKIE_NAME, "")
            .httpOnly(true)
            .secure(true)
            .path("/api/auth")
            .maxAge(0)
            .sameSite("Strict")
            .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    //METODOS PRIVADOS

    private void addRefreshCookie(HttpServletResponse response, String refreshToken) {
        ResponseCookie cookie = ResponseCookie.from(REFRESH_COOKIE_NAME, refreshToken)
            .httpOnly(true)
            .secure(true)
            .path("/api/auth")
            .maxAge(REFRESH_COOKIE_MAX_AGE)
            .sameSite("Strict")
            .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private String extractRefreshCookie(HttpServletRequest request) {
        if (request.getCookies() == null) return null;
        return Arrays.stream(request.getCookies())
            .filter(c -> REFRESH_COOKIE_NAME.equals(c.getName()))
            .map(Cookie::getValue)
            .findFirst()
            .orElse(null);
    }
}
