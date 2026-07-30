package mx.gob.sedif.inventarios.core.Resguardo;

import java.time.LocalDate;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import mx.gob.sedif.inventarios.core.Empleado.Empleado;
import mx.gob.sedif.inventarios.core.HistorialResguardo.HistorialResguardoService;
import mx.gob.sedif.inventarios.exception.InvalidOperationException;
import mx.gob.sedif.inventarios.exception.MessageConstants;
import mx.gob.sedif.inventarios.exception.ResourceNotFoundException;
import mx.gob.sedif.inventarios.util.enums.EstatusResguardo;
import mx.gob.sedif.inventarios.util.enums.Movimiento;

@Component
@RequiredArgsConstructor
public class ResguardoTransactionalHelper {

    private final ResguardoRepository resguardoRepository;
    private final HistorialResguardoService historialService;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public ReasignarLoteError reasignarUnBien(Integer id, Empleado nuevoEmpleado, String motivo) {
        try {
            Resguardo resguardo = resguardoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                    MessageConstants.RESGUARDO_NO_ENCONTRADO.formatted(id)));

            if (resguardo.getEstatusResguardo() != EstatusResguardo.ACTIVO) {
                throw new InvalidOperationException(MessageConstants.REASIGNAR_SOLO_ACTIVO);
            }

            resguardo.setEmpleado(nuevoEmpleado);
            resguardo.setAreaAdscripcion(nuevoEmpleado.getAreaAdscripcion());
            resguardo.setFechaAsignacionBien(LocalDate.now());
            resguardoRepository.save(resguardo);

            historialService.registrarHistorial(resguardo, Movimiento.REASIGNACION, motivo);
            return null;
        } catch (ResourceNotFoundException | InvalidOperationException e) {
            return new ReasignarLoteError(id, e.getMessage());
        }
    }
}
