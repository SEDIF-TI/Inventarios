package mx.gob.sedif.inventarios.core.AreaAdscripcion;

public record AreaAdscripcionRecord(
    Integer id,
    String codigo,
    String descripcion,
    String responsable,
    Boolean areaActiva
) {}
