package mx.gob.sedif.inventarios.core.AreaAdscripcion;

import org.springframework.data.jpa.domain.Specification;

public class AreaAdscripcionSpec {

    public static Specification<AreaAdscripcion> porCodigo(String codigo) {
        return (root, query, cb) -> codigo == null || codigo.isBlank() ? null
            : cb.like(cb.upper(root.get("codigoAreaAdscripcion")), "%" + codigo.toUpperCase() + "%");
    }

    public static Specification<AreaAdscripcion> porDescripcion(String descripcion) {
        return (root, query, cb) -> descripcion == null || descripcion.isBlank() ? null
            : cb.like(cb.upper(root.get("descripcionAreaAdscripcion")), "%" + descripcion.toUpperCase() + "%");
    }
}
