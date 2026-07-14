package mx.gob.sedif.inventarios.core.AreaAdscripcion;

import org.springframework.data.jpa.domain.Specification;

public class AreaAdscripcionSpec {

    /** Búsqueda rápida con OR sobre los campos que muestra la tabla. */
    public static Specification<AreaAdscripcion> porBusqueda(String q) {
        return (root, query, cb) -> {
            if (q == null || q.isBlank()) return null;

            String patron = "%" + q.toUpperCase() + "%";
            return cb.or(
                cb.like(cb.upper(root.get("codigoAreaAdscripcion")), patron),
                cb.like(cb.upper(root.get("descripcionAreaAdscripcion")), patron),
                cb.like(cb.upper(root.get("responsable")), patron)
            );
        };
    }

    public static Specification<AreaAdscripcion> porActiva(Boolean activa) {
        return (root, query, cb) -> activa == null ? null
            : cb.equal(root.get("areaActiva"), activa);
    }

    public static Specification<AreaAdscripcion> porCodigo(String codigo) {
        return (root, query, cb) -> codigo == null || codigo.isBlank() ? null
            : cb.like(cb.upper(root.get("codigoAreaAdscripcion")), "%" + codigo.toUpperCase() + "%");
    }

    public static Specification<AreaAdscripcion> porDescripcion(String descripcion) {
        return (root, query, cb) -> descripcion == null || descripcion.isBlank() ? null
            : cb.like(cb.upper(root.get("descripcionAreaAdscripcion")), "%" + descripcion.toUpperCase() + "%");
    }
}
