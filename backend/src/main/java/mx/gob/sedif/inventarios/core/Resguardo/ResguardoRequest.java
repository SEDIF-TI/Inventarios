package mx.gob.sedif.inventarios.core.Resguardo;

import java.math.BigDecimal;
import java.time.LocalDate;

import mx.gob.sedif.inventarios.util.enums.Estado;

public record ResguardoRequest(
    Integer idAreaAdscripcion,
    Integer idEmpleado,
    Integer cogBien,
    String noInventarioBien,
    String noInternoBien,
    String descripcionBien,
    Estado estadoBien,
    String marcaBien,
    String modeloBien,
    String noSerieBien,
    String materialBien,
    String colorBien,
    String facturaBien,
    String entradaBien,
    String pedidoBien,
    String proveedorBien,
    BigDecimal costoBien,
    LocalDate fechaAsignacionBien,
    String observacion,
    String observacion2,
    Boolean activo
) {}
