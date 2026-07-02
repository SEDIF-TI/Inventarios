package mx.gob.sedif.inventarios.core.Resguardo;

import java.time.LocalDate;
import java.util.List;

public record FormatoResguardoRecord(
    LocalDate fechaEmision,
    String codigoArea,
    String area,
    String noControlEmpleado,
    String nombreEmpleado,
    String unidad,
    String direccion,
    AreaFirmaRecord seccion,
    AreaFirmaRecord departamentoRecursosMateriales,
    List<BienRecord> bienesPatrimoniales,
    List<BienRecord> bienesNoPatrimoniales
) {}