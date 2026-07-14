package mx.gob.sedif.inventarios.core.HistorialResguardo;

import java.time.LocalDate;
import java.time.LocalTime;

import org.springframework.data.jpa.domain.Specification;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import mx.gob.sedif.inventarios.core.AreaAdscripcion.AreaAdscripcion;
import mx.gob.sedif.inventarios.core.Empleado.Empleado;
import mx.gob.sedif.inventarios.core.Resguardo.Resguardo;
import mx.gob.sedif.inventarios.core.Usuario.Usuario;
import mx.gob.sedif.inventarios.util.enums.Movimiento;

public class HistorialResguardoSpec {

    /**
     * Historial de un bien concreto. Es el caso de uso real de esta pantalla y hasta ahora
     * no existía: para ver los movimientos de un bien había que traerse el historial
     * completo del sistema y filtrarlo en el cliente.
     */
    public static Specification<HistorialResguardo> porIdResguardo(Integer idResguardo) {
        return (root, query, cb) -> idResguardo == null ? null
            : cb.equal(root.get("resguardo").get("id"), idResguardo);
    }

    public static Specification<HistorialResguardo> porTipoMovimiento(Movimiento tipoMovimiento) {
        return (root, query, cb) -> tipoMovimiento == null ? null
            : cb.equal(root.get("tipoMovimiento"), tipoMovimiento);
    }

    /** Inclusivo: desde las 00:00 del día indicado. */
    public static Specification<HistorialResguardo> desde(LocalDate fechaDesde) {
        return (root, query, cb) -> fechaDesde == null ? null
            : cb.greaterThanOrEqualTo(root.get("fechaMovimiento"), fechaDesde.atStartOfDay());
    }

    /**
     * Inclusivo: hasta el final del día indicado. Se compara contra 23:59:59.999999999 en
     * lugar de contra la fecha a secas, porque fechaMovimiento es un LocalDateTime y un
     * "hasta el día 5" que corte en 05-00:00 se dejaría fuera todo lo ocurrido ese día.
     */
    public static Specification<HistorialResguardo> hasta(LocalDate fechaHasta) {
        return (root, query, cb) -> fechaHasta == null ? null
            : cb.lessThanOrEqualTo(root.get("fechaMovimiento"), fechaHasta.atTime(LocalTime.MAX));
    }

    /** Búsqueda rápida con OR sobre los campos que muestra la tabla. */
    public static Specification<HistorialResguardo> porBusqueda(String q) {
        return (root, query, cb) -> {
            if (q == null || q.isBlank()) return null;

            String patron = "%" + q.toUpperCase() + "%";
            Join<HistorialResguardo, Resguardo> resguardo = root.join("resguardo", JoinType.LEFT);
            Join<HistorialResguardo, AreaAdscripcion> area = root.join("areaAdscripcion", JoinType.LEFT);
            Join<HistorialResguardo, Empleado> empleado = root.join("empleado", JoinType.LEFT);
            Join<HistorialResguardo, Usuario> usuario = root.join("usuario", JoinType.LEFT);

            return cb.or(
                cb.like(cb.upper(resguardo.get("descripcionBien")), patron),
                cb.like(cb.upper(area.get("descripcionAreaAdscripcion")), patron),
                cb.like(cb.upper(nombreCompleto(cb, empleado)), patron),
                cb.like(cb.upper(root.get("observacion")), patron),
                cb.like(cb.upper(usuario.get("nombreUsuario")), patron)
            );
        };
    }

    private static Expression<String> nombreCompleto(CriteriaBuilder cb, Join<HistorialResguardo, Empleado> empleado) {
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
