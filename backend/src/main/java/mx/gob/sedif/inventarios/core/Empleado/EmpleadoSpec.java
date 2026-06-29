package mx.gob.sedif.inventarios.core.Empleado;

import org.springframework.data.jpa.domain.Specification;

import lombok.var;

public class EmpleadoSpec {

    public static Specification<Empleado> porNombre(String nombre) {
        return (root, query, cb) -> nombre == null || nombre.isBlank() ? null
            : cb.like(cb.upper(root.get("nombreEmpleado")), "%" + nombre.toUpperCase() + "%");
    }

    public static Specification<Empleado> porNoControl(String noControl) {
        return (root, query, cb) -> noControl == null || noControl.isBlank() ? null
            : cb.like(cb.upper(root.get("noControlEmpleado")), "%" + noControl.toUpperCase() + "%"); 
    }

    public static Specification<Empleado> porArea(String area) {
        return (root, query, cb) -> {
            if (area == null || area.isBlank()) return null;
            var join = root.join("areaAdscripcion");
            return cb.like(cb.upper(join.get("descripcionAreaAdscripcion")), "%" + area.toUpperCase() + "%");
        };
    }
}
