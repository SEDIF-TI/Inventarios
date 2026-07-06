package mx.gob.sedif.inventarios.core.Usuario;

import org.springframework.data.jpa.domain.Specification;

import mx.gob.sedif.inventarios.util.enums.Rol;

public class UsuarioSpec {

    public static Specification<Usuario> porNombreUsuario(String nombreUsuario) {
        return (root, query, cb) -> nombreUsuario == null || nombreUsuario.isBlank() ? null
            : cb.like(cb.upper(root.get("nombreUsuario")), "%" + nombreUsuario.toUpperCase() + "%");
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
