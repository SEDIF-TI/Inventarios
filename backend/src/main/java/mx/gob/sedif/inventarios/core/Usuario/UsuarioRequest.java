package mx.gob.sedif.inventarios.core.Usuario;

import mx.gob.sedif.inventarios.util.enums.Rol;

public record UsuarioRequest(
    String nombreUsuario,
    String password,
    Rol rol,
    Boolean activo
) {}
