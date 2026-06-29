package mx.gob.sedif.inventarios.core.Resguardo;

import org.springframework.data.jpa.domain.Specification;

import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import mx.gob.sedif.inventarios.core.AreaAdscripcion.AreaAdscripcion;
import mx.gob.sedif.inventarios.core.Empleado.Empleado;

public class ResguardoSpec {

    public static Specification<Resguardo> porArea(String area){
        return (root, query, cb) -> {
            if (area == null || area.isBlank()) return null;
            Join<Resguardo, AreaAdscripcion> join = root.join("areaAdscripcion", JoinType.LEFT);
            return cb.like(cb.upper(join.get("descripcionAreaAdscripcion")), "%" + area.toUpperCase() + "%");
        };
    }

    public static Specification<Resguardo> porDescripcion(String descripcion) {
        return (root, query, cb) -> descripcion == null || descripcion.isBlank() ? null
            : cb.like(cb.upper(root.get("descripcionBien")), "%" + descripcion.toUpperCase() + "%");
    }

    public static Specification<Resguardo> porEmpleado(String empleado) {
    return (root, query, cb) -> {
        if (empleado == null || empleado.isBlank()) return null;
        Join<Resguardo, Empleado> join = root.join("empleado", JoinType.LEFT);
        Expression<String> nombreCompleto = cb.concat(
            cb.concat(
                cb.concat(join.get("nombreEmpleado"), " "),
                join.get("apellidoPaternoEmpleado")
            ),
            cb.concat(" ", join.get("apellidoMaternoEmpleado"))
        );
        return cb.like(cb.upper(nombreCompleto), "%" + empleado.toUpperCase() + "%");
    };
}

    public static Specification<Resguardo> porNoInventario(String noInventario) {
        return (root, query, cb) -> noInventario == null || noInventario.isBlank() ? null
            : cb.like(cb.upper(root.get("noInventarioBien")), "%" + noInventario.toUpperCase() + "%");
    }
}
