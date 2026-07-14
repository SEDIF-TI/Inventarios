package mx.gob.sedif.inventarios.config;

import java.io.IOException;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.http.HttpMethod;

import static org.springframework.security.config.Customizer.withDefaults;

import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import mx.gob.sedif.inventarios.exception.ApiResponse;
import mx.gob.sedif.inventarios.exception.MessageConstants;
import mx.gob.sedif.inventarios.security.JwtAuthFilter;
import mx.gob.sedif.inventarios.security.RateLimitingFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final RateLimitingFilter rateLimitFilter;
    private final ObjectMapper objectMapper;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(withDefaults())
            // CSRF se deshabilita porque la API es stateless (sin sesiones HTTP).
            // La autenticación se gestiona mediante JWT en headers Authorization,
            // no cookies de sesión. Las cookies refresh usan SameSite=Strict
            // como protección adicional contra CSRF.
            .csrf(csrf -> csrf.disable())
            .headers(headers -> headers
                .frameOptions(frame -> frame.deny())
                .contentTypeOptions(withDefaults())
                .httpStrictTransportSecurity(hsts -> hsts
                    .includeSubDomains(true)
                    .maxAgeInSeconds(31536000))
                .contentSecurityPolicy(csp -> csp.policyDirectives(
                    "default-src 'self'; " +
                    "img-src 'self' data:; " +
                    "style-src 'self' 'unsafe-inline'; " +
                    "frame-ancestors 'none'"))
            )
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/actuator/health").permitAll()
                .requestMatchers("/api/usuarios/**").hasAnyRole("SUPERADMIN", "ADMIN")
                .requestMatchers("/api/resguardos/**").hasAnyRole("SUPERADMIN", "ADMIN", "ANALISTA")
                .requestMatchers("/api/historial/**").hasAnyRole("SUPERADMIN", "ADMIN", "ANALISTA")
                .requestMatchers(HttpMethod.GET, "/api/areas/listarActivas").hasAnyRole("SUPERADMIN", "ADMIN", "ANALISTA")
                .requestMatchers(HttpMethod.GET, "/api/empleados/listarActivos").hasAnyRole("SUPERADMIN", "ADMIN", "ANALISTA")
                .requestMatchers("/api/**").hasAnyRole("SUPERADMIN", "ADMIN")
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint((HttpServletRequest request, HttpServletResponse response, AuthenticationException authException) -> {
                    response.setStatus(401);
                    response.setContentType("application/json");
                    response.getWriter().write(
                        objectMapper.writeValueAsString(ApiResponse.error(MessageConstants.NO_AUTENTICADO))
                    );
                })
                .accessDeniedHandler((HttpServletRequest request, HttpServletResponse response, org.springframework.security.access.AccessDeniedException accessDeniedException) -> {
                    response.setStatus(403);
                    response.setContentType("application/json");
                    response.getWriter().write(
                        objectMapper.writeValueAsString(ApiResponse.error(MessageConstants.ACCESO_DENEGADO))
                    );
                })
            )
            .addFilterBefore(rateLimitFilter, UsernamePasswordAuthenticationFilter.class)
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
