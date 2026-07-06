package mx.gob.sedif.inventarios.core.HistorialResguardo;

import java.time.LocalDateTime;

import mx.gob.sedif.inventarios.util.enums.Movimiento;

public record HistorialResguardoRecord(
    Integer id,
    Integer idResguardo,
    String descripcionBien,
    Integer idAreaAdscripcion,
    String areaAdscripcion,
    Integer idEmpleado,
    String empleado,
    LocalDateTime fechaMovimiento,
    String observacion,
    Movimiento tipoMovimiento,
    Integer idUsuario,
    String nombreUsuario
) {}
