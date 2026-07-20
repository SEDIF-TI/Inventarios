package mx.gob.sedif.inventarios.core.Resguardo;

import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

public record ReasignarLoteRequest(
    @NotEmpty(message = "Debe seleccionar al menos un bien")
    List<Integer> ids,
    @NotNull(message = "El empleado es obligatorio")
    Integer idNuevoEmpleado,
    @NotBlank(message = "El motivo es obligatorio")
    String motivo
) {}
