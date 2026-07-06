package mx.gob.sedif.inventarios.core.Resguardo;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ReasignarRequest(
    @NotNull(message = "El empleado es obligatorio")
    Integer idNuevoEmpleado,
    @NotBlank(message = "El motivo es obligatorio")
    String motivo
) {}
