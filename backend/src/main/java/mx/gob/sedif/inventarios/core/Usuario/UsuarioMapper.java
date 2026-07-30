package mx.gob.sedif.inventarios.core.Usuario;

import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UsuarioMapper {

    UsuarioRecord toRecord(Usuario u);
}
