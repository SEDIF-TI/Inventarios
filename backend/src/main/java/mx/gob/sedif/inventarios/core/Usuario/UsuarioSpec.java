package mx.gob.sedif.inventarios.core.Usuario;

import java.util.Arrays;
import java.util.List;

import org.springframework.data.jpa.domain.Specification;

import jakarta.persistence.criteria.Predicate;
import mx.gob.sedif.inventarios.util.SpecUtil;
import mx.gob.sedif.inventarios.util.enums.Rol;

public class UsuarioSpec {

    public static Specification<Usuario> porBusqueda(String q) {
        return (root, query, cb) -> {
            if (q == null || q.isBlank()) return null;

            String termino = q.toUpperCase();
            Predicate porNombre = cb.like(
                cb.upper(root.get("nombreUsuario")),
                "%" + SpecUtil.escapeLike(termino) + "%", '\\');

            List<Rol> rolesCoincidentes = Arrays.stream(Rol.values())
                .filter(rol -> rol.name().contains(termino))
                .toList();

            return rolesCoincidentes.isEmpty()
                ? porNombre
                : cb.or(porNombre, root.get("rol").in(rolesCoincidentes));
        };
    }

    public static Specification<Usuario> porNombreUsuario(String nombreUsuario) {
        return (root, query, cb) -> {
            if (nombreUsuario == null || nombreUsuario.isBlank()) return null;
            String patron = "%" + SpecUtil.escapeLike(nombreUsuario.toUpperCase()) + "%";
            return cb.like(cb.upper(root.get("nombreUsuario")), patron, '\\');
        };
    }

    public static Specification<Usuario> porRol(Rol rol) {
        return (root, query, cb) -> rol == null ? null
            : cb.equal(root.get("rol"), rol);
    }

    public static Specification<Usuario> porActivo(Boolean activo) {
        return (root, query, cb) -> activo == null ? null
            : cb.equal(root.get("activo"), activo);
    }
}
