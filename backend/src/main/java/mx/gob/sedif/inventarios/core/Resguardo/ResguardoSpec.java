package mx.gob.sedif.inventarios.core.Resguardo;

import java.time.LocalDate;

import org.springframework.data.jpa.domain.Specification;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import mx.gob.sedif.inventarios.core.AreaAdscripcion.AreaAdscripcion;
import mx.gob.sedif.inventarios.core.Empleado.Empleado;
import mx.gob.sedif.inventarios.util.SpecUtil;
import mx.gob.sedif.inventarios.util.enums.EstatusResguardo;

public class ResguardoSpec {

    public static Specification<Resguardo> porBusqueda(String q) {
        return (root, query, cb) -> {
            if (q == null || q.isBlank()) return null;

            String patron = "%" + SpecUtil.escapeLike(q.toUpperCase()) + "%";
            Join<Resguardo, AreaAdscripcion> area = root.join("areaAdscripcion", JoinType.LEFT);
            Join<Resguardo, Empleado> empleado = root.join("empleado", JoinType.LEFT);

            return cb.or(
                cb.like(cb.upper(root.get("noInventarioBien")), patron, '\\'),
                cb.like(cb.upper(root.get("descripcionBien")), patron, '\\'),
                cb.like(cb.upper(area.get("descripcionAreaAdscripcion")), patron, '\\'),
                cb.like(cb.upper(nombreCompleto(cb, empleado)), patron, '\\')
            );
        };
    }

    public static Specification<Resguardo> porIdArea(Integer idArea) {
        return (root, query, cb) -> idArea == null ? null
            : cb.equal(root.get("areaAdscripcion").get("id"), idArea);
    }

    public static Specification<Resguardo> porFechaAsignacion(LocalDate fecha) {
        return (root, query, cb) -> fecha == null ? null
            : cb.equal(root.get("fechaAsignacionBien"), fecha);
    }

    public static Specification<Resguardo> porEstatus(EstatusResguardo estatus) {
        return (root, query, cb) -> estatus == null ? null
            : cb.equal(root.get("estatusResguardo"), estatus);
    }

    public static Specification<Resguardo> porArea(String area){
        return (root, query, cb) -> {
            if (area == null || area.isBlank()) return null;
            Join<Resguardo, AreaAdscripcion> join = root.join("areaAdscripcion", JoinType.LEFT);
            String patron = "%" + SpecUtil.escapeLike(area.toUpperCase()) + "%";
            return cb.like(cb.upper(join.get("descripcionAreaAdscripcion")), patron, '\\');
        };
    }

    public static Specification<Resguardo> porDescripcion(String descripcion) {
        return (root, query, cb) -> {
            if (descripcion == null || descripcion.isBlank()) return null;
            String patron = "%" + SpecUtil.escapeLike(descripcion.toUpperCase()) + "%";
            return cb.like(cb.upper(root.get("descripcionBien")), patron, '\\');
        };
    }

    public static Specification<Resguardo> porEmpleado(String empleado) {
        return (root, query, cb) -> {
            if (empleado == null || empleado.isBlank()) return null;
            Join<Resguardo, Empleado> join = root.join("empleado", JoinType.LEFT);
            String patron = "%" + SpecUtil.escapeLike(empleado.toUpperCase()) + "%";
            return cb.like(cb.upper(nombreCompleto(cb, join)), patron, '\\');
        };
    }

    public static Specification<Resguardo> porNoInventario(String noInventario) {
        return (root, query, cb) -> {
            if (noInventario == null || noInventario.isBlank()) return null;
            String patron = "%" + SpecUtil.escapeLike(noInventario.toUpperCase()) + "%";
            return cb.like(cb.upper(root.get("noInventarioBien")), patron, '\\');
        };
    }

    private static Expression<String> nombreCompleto(CriteriaBuilder cb, Join<Resguardo, Empleado> empleado) {
        return cb.concat(
            cb.concat(
                cb.concat(
                    cb.concat(cb.coalesce(empleado.get("nombreEmpleado"), ""), " "),
                    cb.coalesce(empleado.get("apellidoPaternoEmpleado"), "")
                ),
                " "
            ),
            cb.coalesce(empleado.get("apellidoMaternoEmpleado"), "")
        );
    }
}
