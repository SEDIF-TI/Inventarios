package mx.gob.sedif.inventarios.security;

import java.io.IOException;
import java.time.Duration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import mx.gob.sedif.inventarios.exception.ApiResponse;
import mx.gob.sedif.inventarios.exception.MessageConstants;

/**
 * Rate limiting por IP usando Bucket4j + Caffeine.
 * <p>
 * Limitación conocida: en un despliegue multi-instancia (Docker Compose scale, K8s)
 * cada réplica mantiene su propio contador. Un cliente con 5 req/min puede hacer
 * 5×N req/min si hay N instancias. Para resolverlo se necesita un backend compartido
 * (Redis, JDBC) o un rate limiter en el reverse proxy (NPM, Kong, etc.).
 */
@Component
@RequiredArgsConstructor
public class RateLimitingFilter extends OncePerRequestFilter {

    @Value("${rate-limit.capacity:5}")
    private int capacity;

    @Value("${rate-limit.refill-tokens:5}")
    private int refillTokens;

    @Value("${rate-limit.refill-duration-minutes:1}")
    private int refillDurationMinutes;

    private final Cache<String, Bucket> buckets = Caffeine.newBuilder()
        .maximumSize(10_000)
        .expireAfterAccess(Duration.ofMinutes(5))
        .build();

    private final ObjectMapper objectMapper;

    private String getClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private Bucket newBucket() {
        Bandwidth limit = Bandwidth.builder()
            .capacity(capacity)
            .refillGreedy(refillTokens, Duration.ofMinutes(refillDurationMinutes))
            .build();
        return Bucket.builder().addLimit(limit).build();
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return !path.startsWith("/api/auth/");
    }

    @Override
    protected void doFilterInternal(
        @NonNull HttpServletRequest request,
        @NonNull HttpServletResponse response,
        @NonNull FilterChain filterChain) throws ServletException, IOException {

            String key = getClientIp(request);
            Bucket bucket = buckets.get(key, k -> newBucket());

            if (bucket.tryConsume(1)) {
                filterChain.doFilter(request, response);
            } else {
                response.setStatus(429);
                response.setContentType("application/json");
                response.getWriter().write(
                    objectMapper.writeValueAsString(
                        ApiResponse.error(MessageConstants.RATE_LIMIT_EXCEDIDO)
                    )
                );
            }
    }
}
