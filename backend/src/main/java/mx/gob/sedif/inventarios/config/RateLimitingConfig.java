package mx.gob.sedif.inventarios.config;

import java.time.Duration;
import java.util.function.Supplier;

import javax.sql.DataSource;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.BucketConfiguration;
import io.github.bucket4j.distributed.jdbc.PrimaryKeyMapper;
import io.github.bucket4j.postgresql.Bucket4jPostgreSQL;
import io.github.bucket4j.postgresql.PostgreSQLSelectForUpdateBasedProxyManager;
import mx.gob.sedif.inventarios.security.BucketProvider;

@Configuration
public class RateLimitingConfig {

    @Value("${rate-limit.capacity:5}")
    private int capacity;

    @Value("${rate-limit.refill-tokens:5}")
    private int refillTokens;

    @Value("${rate-limit.refill-duration-minutes:1}")
    private int refillDurationMinutes;

    @Bean
    @ConditionalOnProperty(name = "rate-limit.backend", havingValue = "caffeine", matchIfMissing = true)
    public BucketProvider caffeineBucketProvider() {
        Cache<String, Bucket> cache = Caffeine.newBuilder()
            .maximumSize(10_000)
            .expireAfterAccess(Duration.ofMinutes(5))
            .build();
        return key -> cache.get(key, k -> Bucket.builder()
            .addLimit(Bandwidth.builder()
                .capacity(capacity)
                .refillGreedy(refillTokens, Duration.ofMinutes(refillDurationMinutes))
                .build())
            .build());
    }

    @Bean
    @ConditionalOnProperty(name = "rate-limit.backend", havingValue = "jpa")
    public BucketProvider jdbcBucketProvider(DataSource dataSource) {
        PostgreSQLSelectForUpdateBasedProxyManager<String> proxyManager =
            Bucket4jPostgreSQL.selectForUpdateBasedBuilder(dataSource)
                .primaryKeyMapper(PrimaryKeyMapper.STRING)
                .table("bucket4j_buckets")
                .idColumn("id")
                .stateColumn("state")
                .build();

        Supplier<BucketConfiguration> configSupplier = () -> BucketConfiguration.builder()
            .addLimit(Bandwidth.builder()
                .capacity(capacity)
                .refillGreedy(refillTokens, Duration.ofMinutes(refillDurationMinutes))
                .build())
            .build();

        return key -> proxyManager.builder().build(key, configSupplier);
    }
}