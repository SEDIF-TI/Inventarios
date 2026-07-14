package mx.gob.sedif.inventarios.core.Resguardo;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import mx.gob.sedif.inventarios.core.Empleado.Empleado;

@Mapper(componentModel = "spring")
public interface ResguardoMapper {

    @Mapping(source = "id", target = "id")
    @Mapping(source = "areaAdscripcion.id", target = "idAreaAdscripcion")
    @Mapping(source = "areaAdscripcion.codigoAreaAdscripcion", target = "codigoAreaAdscripcion")
    @Mapping(source = "areaAdscripcion.descripcionAreaAdscripcion", target = "areaAdscripcion")
    @Mapping(target = "idEmpleado", expression = "java(e.getEmpleado() != null ? e.getEmpleado().getId() : null)")
    @Mapping(target = "empleado", expression = "java(concatenarNombre(e.getEmpleado()))")
    @Mapping(target = "noControlEmpleado", expression = "java(e.getEmpleado() != null ? e.getEmpleado().getNoControlEmpleado() : null)")
    @Mapping(source = "cogBien", target = "cogBien")
    @Mapping(source = "noInventarioBien", target = "noInventarioBien")
    @Mapping(source = "noInternoBien", target = "noInternoBien")
    @Mapping(source = "descripcionBien", target = "descripcionBien")
    @Mapping(source = "estadoBien", target = "estadoBien")
    @Mapping(source = "marcaBien", target = "marcaBien")
    @Mapping(source = "modeloBien", target = "modeloBien")
    @Mapping(source = "noSerieBien", target = "noSerieBien")
    @Mapping(source = "materialBien", target = "materialBien")
    @Mapping(source = "colorBien", target = "colorBien")
    @Mapping(source = "facturaBien", target = "facturaBien")
    @Mapping(source = "entradaBien", target = "entradaBien")
    @Mapping(source = "pedidoBien", target = "pedidoBien")
    @Mapping(source = "proveedorBien", target = "proveedorBien")
    @Mapping(source = "costoBien", target = "costoBien")
    @Mapping(source = "fechaAsignacionBien", target = "fechaAsignacionBien")
    @Mapping(source = "observacion", target = "observacion")
    @Mapping(source = "observacion2", target = "observacion2")
    @Mapping(source = "estatusResguardo", target = "estatus")
    @Mapping(source = "activo", target = "activo")
    ResguardoRecord toRecord(Resguardo e);

    default String concatenarNombre(Empleado e) {
        if (e == null) return null;
        return e.getApellidoPaternoEmpleado() + " " +
               e.getApellidoMaternoEmpleado() + " " +
               e.getNombreEmpleado();
    }
}
