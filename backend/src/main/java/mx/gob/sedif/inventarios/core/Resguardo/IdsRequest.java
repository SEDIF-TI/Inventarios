package mx.gob.sedif.inventarios.core.Resguardo;

import java.util.List;

import jakarta.validation.constraints.NotEmpty;

public record IdsRequest(
    @NotEmpty(message = "Debe seleccionar al menos un bien")
    List<Integer> ids
) {}
