package mx.gob.sedif.inventarios.core.Empleado;

public record EmpleadoRecord(
    Integer id,
    String noControlEmpleado,
    String nombreEmpleado,
    String apellidoPaternoEmpleado,
    String apellidoMaternoEmpleado,
    String areaAdscripcion,
    Boolean empleadoActivo
) {
}
