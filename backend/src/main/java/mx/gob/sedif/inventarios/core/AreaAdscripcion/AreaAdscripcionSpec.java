package mx.gob.sedif.inventarios.core.AreaAdscripcion;

import org.springframework.data.jpa.domain.Specification;

import mx.gob.sedif.inventarios.util.SpecUtil;

public class AreaAdscripcionSpec {

    public static Specification<AreaAdscripcion> porBusqueda(String q) {
        return (root, query, cb) -> {
            if (q == null || q.isBlank()) return null;

            String patron = "%" + SpecUtil.escapeLike(q.toUpperCase()) + "%";
            return cb.or(
                cb.like(cb.upper(root.get("codigoAreaAdscripcion")), patron, '\\'),
                cb.like(cb.upper(root.get("descripcionAreaAdscripcion")), patron, '\\'),
                cb.like(cb.upper(root.get("responsable")), patron, '\\')
            );
        };
    }

    public static Specification<AreaAdscripcion> porActiva(Boolean activa) {
        return (root, query, cb) -> activa == null ? null
            : cb.equal(root.get("areaActiva"), activa);
    }

    public static Specification<AreaAdscripcion> porCodigo(String codigo) {
        return (root, query, cb) -> {
            if (codigo == null || codigo.isBlank()) return null;
            String patron = "%" + SpecUtil.escapeLike(codigo.toUpperCase()) + "%";
            return cb.like(cb.upper(root.get("codigoAreaAdscripcion")), patron, '\\');
        };
    }

    public static Specification<AreaAdscripcion> porDescripcion(String descripcion) {
        return (root, query, cb) -> {
            if (descripcion == null || descripcion.isBlank()) return null;
            String patron = "%" + SpecUtil.escapeLike(descripcion.toUpperCase()) + "%";
            return cb.like(cb.upper(root.get("descripcionAreaAdscripcion")), patron, '\\');
        };
    }
}
