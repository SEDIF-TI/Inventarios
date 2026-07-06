package mx.gob.sedif.inventarios.core.Usuario;

import mx.gob.sedif.inventarios.util.enums.Rol;

public record UsuarioRecord(
    Integer id,
    String nombreUsuario,
    Rol rol,
    Boolean activo
) {}
