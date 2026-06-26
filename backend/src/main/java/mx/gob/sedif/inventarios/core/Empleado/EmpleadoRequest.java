package mx.gob.sedif.inventarios.core.Empleado;

public record EmpleadoRequest(
    String noControlEmpleado,
    String nombreEmpleado,
    String apellidoPaternoEmpleado,
    String apellidoMaternoEmpleado,
    Integer idAreaAdscripcion,
    Boolean empleadoActivo
) {}
