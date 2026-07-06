package mx.gob.sedif.inventarios.core.Resguardo;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AsignarRequest(
    @NotNull(message = "El empleado es obligatorio")
    Integer idEmpleado,
    @NotNull(message = "El área de adscripción es obligatoria")
    Integer idAreaAdscripcion,
    @NotBlank(message = "El motivo es obligatorio")
    String motivo
) {}
