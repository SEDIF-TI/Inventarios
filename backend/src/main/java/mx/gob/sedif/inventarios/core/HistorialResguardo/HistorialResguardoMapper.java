package mx.gob.sedif.inventarios.core.HistorialResguardo;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import mx.gob.sedif.inventarios.core.Empleado.Empleado;

@Mapper(componentModel = "spring")
public interface HistorialResguardoMapper {

    @Mapping(target = "idResguardo", expression = "java(h.getResguardo() != null ? h.getResguardo().getId() : null)")
    @Mapping(target = "descripcionBien", expression = "java(h.getResguardo() != null ? h.getResguardo().getDescripcionBien() : null)")
    @Mapping(target = "idAreaAdscripcion", expression = "java(h.getAreaAdscripcion() != null ? h.getAreaAdscripcion().getId() : null)")
    @Mapping(target = "areaAdscripcion", expression = "java(h.getAreaAdscripcion() != null ? h.getAreaAdscripcion().getDescripcionAreaAdscripcion() : null)")
    @Mapping(target = "idEmpleado", expression = "java(h.getEmpleado() != null ? h.getEmpleado().getId() : null)")
    @Mapping(target = "empleado", expression = "java(nombreCompleto(h.getEmpleado()))")
    @Mapping(target = "idUsuario", expression = "java(h.getUsuario() != null ? h.getUsuario().getId() : null)")
    @Mapping(target = "nombreUsuario", expression = "java(h.getUsuario() != null ? h.getUsuario().getNombreUsuario() : null)")
    HistorialResguardoRecord toRecord(HistorialResguardo h);

    default String nombreCompleto(Empleado e) {
        if (e == null) return null;
        return e.getNombreEmpleado() + " " +
               e.getApellidoPaternoEmpleado() + " " +
               e.getApellidoMaternoEmpleado();
    }
}
