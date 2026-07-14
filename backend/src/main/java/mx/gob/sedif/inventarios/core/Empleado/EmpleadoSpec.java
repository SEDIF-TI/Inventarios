package mx.gob.sedif.inventarios.core.Empleado;

import org.springframework.data.jpa.domain.Specification;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import mx.gob.sedif.inventarios.core.AreaAdscripcion.AreaAdscripcion;

public class EmpleadoSpec {

    /** Búsqueda rápida con OR sobre los campos que muestra la tabla. */
    public static Specification<Empleado> porBusqueda(String q) {
        return (root, query, cb) -> {
            if (q == null || q.isBlank()) return null;

            String patron = "%" + q.toUpperCase() + "%";
            Join<Empleado, AreaAdscripcion> area = root.join("areaAdscripcion", JoinType.LEFT);

            return cb.or(
                cb.like(cb.upper(root.get("noControlEmpleado")), patron),
                cb.like(cb.upper(root.get("nombreEmpleado")), patron),
                cb.like(cb.upper(root.get("apellidoPaternoEmpleado")), patron),
                cb.like(cb.upper(root.get("apellidoMaternoEmpleado")), patron),
                cb.like(cb.upper(area.get("descripcionAreaAdscripcion")), patron)
            );
        };
    }

    public static Specification<Empleado> porActivo(Boolean activo) {
        return (root, query, cb) -> activo == null ? null
            : cb.equal(root.get("empleadoActivo"), activo);
    }

    public static Specification<Empleado> porNombre(String nombre) {
        return (root, query, cb) -> nombre == null || nombre.isBlank() ? null
            : cb.like(cb.upper(root.get("nombreEmpleado")), "%" + nombre.toUpperCase() + "%");
    }

    public static Specification<Empleado> porApellidoPaterno(String apellidoPaterno) {
        return (root, query, cb) -> apellidoPaterno == null || apellidoPaterno.isBlank() ? null
            : cb.like(cb.upper(root.get("apellidoPaternoEmpleado")), "%" + apellidoPaterno.toUpperCase() + "%");
    }

    public static Specification<Empleado> porApellidoMaterno(String apellidoMaterno) {
        return (root, query, cb) -> apellidoMaterno == null || apellidoMaterno.isBlank() ? null
            : cb.like(cb.upper(root.get("apellidoMaternoEmpleado")), "%" + apellidoMaterno.toUpperCase() + "%");
    }

    public static Specification<Empleado> porNoControl(String noControl) {
        return (root, query, cb) -> noControl == null || noControl.isBlank() ? null
            : cb.like(cb.upper(root.get("noControlEmpleado")), "%" + noControl.toUpperCase() + "%"); 
    }

    public static Specification<Empleado> porArea(String area) {
        return (root, query, cb) -> {
            if (area == null || area.isBlank()) return null;
            Join<Empleado, AreaAdscripcion> join = root.join("areaAdscripcion", JoinType.LEFT);
            return cb.like(cb.upper(join.get("descripcionAreaAdscripcion")), "%" + area.toUpperCase() + "%");
        };
    }
}
