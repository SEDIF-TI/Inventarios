package mx.gob.sedif.inventarios.security;

import io.github.bucket4j.Bucket;

@FunctionalInterface
public interface BucketProvider {
    Bucket getOrCreate(String key);
}
