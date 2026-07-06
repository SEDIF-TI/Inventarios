package mx.gob.sedif.inventarios.core.Resguardo;

import jakarta.validation.constraints.NotBlank;

public record MotivoRequest(
    @NotBlank(message = "El motivo es obligatorio")
    String motivo
) {}
