package mx.gob.sedif.inventarios.util;

import java.util.List;

import org.springframework.data.domain.Page;

/**
 * Envoltura estable para respuestas paginadas.
 *
 * Se usa en lugar de serializar {@link Page} directamente: Spring Data desaconseja
 * exponer PageImpl en la API (emite un warning en runtime) porque su JSON incluye
 * metadatos internos que pueden cambiar entre versiones.
 */
public record PagedResponse<T>(
    List<T> content,
    int page,
    int size,
    long totalElements,
    int totalPages
) {
    public static <T> PagedResponse<T> from(Page<T> page) {
        return new PagedResponse<>(
            page.getContent(),
            page.getNumber(),
            page.getSize(),
            page.getTotalElements(),
            page.getTotalPages()
        );
    }
}
