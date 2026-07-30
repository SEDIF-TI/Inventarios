package mx.gob.sedif.inventarios.core.AreaAdscripcion;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AreaAdscripcionMapper {

    @Mapping(source = "codigoAreaAdscripcion", target = "codigo")
    @Mapping(source = "descripcionAreaAdscripcion", target = "descripcion")
    AreaAdscripcionRecord toRecord(AreaAdscripcion a);
}
