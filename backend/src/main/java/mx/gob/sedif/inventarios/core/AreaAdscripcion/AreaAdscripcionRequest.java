package mx.gob.sedif.inventarios.core.AreaAdscripcion;

public record AreaAdscripcionRequest(
    String codigoAreaAdscripcion,
    String descripcionAreaAdscripcion,
    String responsable,
    Boolean areaActiva
) {}