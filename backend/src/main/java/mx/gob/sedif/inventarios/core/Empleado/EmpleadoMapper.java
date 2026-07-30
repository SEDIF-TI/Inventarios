package mx.gob.sedif.inventarios.core.Empleado;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface EmpleadoMapper {

    @Mapping(target = "areaAdscripcion", expression = "java(areaDescripcion(e))")
    EmpleadoRecord toRecord(Empleado e);

    default String areaDescripcion(Empleado e) {
        return e.getAreaAdscripcion() != null
            ? e.getAreaAdscripcion().getDescripcionAreaAdscripcion()
            : null;
    }
}
