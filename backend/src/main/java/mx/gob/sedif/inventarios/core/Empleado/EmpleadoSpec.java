package mx.gob.sedif.inventarios.core.Empleado;

import org.springframework.data.jpa.domain.Specification;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import mx.gob.sedif.inventarios.core.AreaAdscripcion.AreaAdscripcion;
import mx.gob.sedif.inventarios.util.SpecUtil;

public class EmpleadoSpec {

    public static Specification<Empleado> porBusqueda(String q) {
        return (root, query, cb) -> {
            if (q == null || q.isBlank()) return null;

            String patron = "%" + SpecUtil.escapeLike(q.toUpperCase()) + "%";
            Join<Empleado, AreaAdscripcion> area = root.join("areaAdscripcion", JoinType.LEFT);

            return cb.or(
                cb.like(cb.upper(root.get("noControlEmpleado")), patron, '\\'),
                cb.like(cb.upper(root.get("nombreEmpleado")), patron, '\\'),
                cb.like(cb.upper(root.get("apellidoPaternoEmpleado")), patron, '\\'),
                cb.like(cb.upper(root.get("apellidoMaternoEmpleado")), patron, '\\'),
                cb.like(cb.upper(area.get("descripcionAreaAdscripcion")), patron, '\\')
            );
        };
    }

    public static Specification<Empleado> porActivo(Boolean activo) {
        return (root, query, cb) -> activo == null ? null
            : cb.equal(root.get("empleadoActivo"), activo);
    }

    public static Specification<Empleado> porNombre(String nombre) {
        return (root, query, cb) -> {
            if (nombre == null || nombre.isBlank()) return null;
            String patron = "%" + SpecUtil.escapeLike(nombre.toUpperCase()) + "%";
            return cb.like(cb.upper(root.get("nombreEmpleado")), patron, '\\');
        };
    }

    public static Specification<Empleado> porApellidoPaterno(String apellidoPaterno) {
        return (root, query, cb) -> {
            if (apellidoPaterno == null || apellidoPaterno.isBlank()) return null;
            String patron = "%" + SpecUtil.escapeLike(apellidoPaterno.toUpperCase()) + "%";
            return cb.like(cb.upper(root.get("apellidoPaternoEmpleado")), patron, '\\');
        };
    }

    public static Specification<Empleado> porApellidoMaterno(String apellidoMaterno) {
        return (root, query, cb) -> {
            if (apellidoMaterno == null || apellidoMaterno.isBlank()) return null;
            String patron = "%" + SpecUtil.escapeLike(apellidoMaterno.toUpperCase()) + "%";
            return cb.like(cb.upper(root.get("apellidoMaternoEmpleado")), patron, '\\');
        };
    }

    public static Specification<Empleado> porNoControl(String noControl) {
        return (root, query, cb) -> {
            if (noControl == null || noControl.isBlank()) return null;
            String patron = "%" + SpecUtil.escapeLike(noControl.toUpperCase()) + "%";
            return cb.like(cb.upper(root.get("noControlEmpleado")), patron, '\\');
        };
    }

    public static Specification<Empleado> porArea(String area) {
        return (root, query, cb) -> {
            if (area == null || area.isBlank()) return null;
            Join<Empleado, AreaAdscripcion> join = root.join("areaAdscripcion", JoinType.LEFT);
            String patron = "%" + SpecUtil.escapeLike(area.toUpperCase()) + "%";
            return cb.like(cb.upper(join.get("descripcionAreaAdscripcion")), patron, '\\');
        };
    }
}
