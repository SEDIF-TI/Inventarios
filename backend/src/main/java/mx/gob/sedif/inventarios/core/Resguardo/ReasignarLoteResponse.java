package mx.gob.sedif.inventarios.core.Resguardo;

import java.util.List;

public record ReasignarLoteResponse(
    List<Integer> exitosos,
    List<ReasignarLoteError> errores
) {}
