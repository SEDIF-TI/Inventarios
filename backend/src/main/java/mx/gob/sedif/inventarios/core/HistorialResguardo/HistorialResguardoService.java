package mx.gob.sedif.inventarios.core.HistorialResguardo;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import mx.gob.sedif.inventarios.core.Resguardo.Resguardo;
import mx.gob.sedif.inventarios.core.Usuario.UsuarioRepository;
import mx.gob.sedif.inventarios.util.enums.Movimiento;

@Service
@RequiredArgsConstructor
public class HistorialResguardoService {

    private final HistorialResguardoRepository historialRepository;
    private final UsuarioRepository usuarioRepository;

    @Transactional(readOnly = true)
    public List<HistorialResguardoRecord> listarHistorial() {
        return historialRepository.findAllConRelaciones().stream()
            .map(this::toRecord)
            .toList();
    }

    @Transactional
    public void registrarHistorial(Resguardo resguardo, Movimiento tipoMovimiento, String observacion) {
        HistorialResguardo historial = new HistorialResguardo();
        historial.setResguardo(resguardo);
        historial.setAreaAdscripcion(resguardo.getAreaAdscripcion());
        historial.setEmpleado(resguardo.getEmpleado());
        historial.setFechaMovimiento(LocalDateTime.now());
        historial.setObservacion(observacion);
        historial.setTipoMovimiento(tipoMovimiento);

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
            usuarioRepository.findByNombreUsuario(auth.getName())
                .ifPresent(historial::setUsuario);
        }

        historialRepository.save(historial);
    }

    // MÉTODOS PRIVADOS-----

    private HistorialResguardoRecord toRecord(HistorialResguardo h) {
        return new HistorialResguardoRecord(
            h.getId(),
            h.getResguardo() != null ? h.getResguardo().getId() : null,
            h.getResguardo() != null ? h.getResguardo().getDescripcionBien() : null,
            h.getAreaAdscripcion() != null ? h.getAreaAdscripcion().getId() : null,
            h.getAreaAdscripcion() != null ? h.getAreaAdscripcion().getDescripcionAreaAdscripcion() : null,
            h.getEmpleado() != null ? h.getEmpleado().getId() : null,
            h.getEmpleado() != null ? h.getEmpleado().getNombreEmpleado() + " " +
                h.getEmpleado().getApellidoPaternoEmpleado() + " " +
                h.getEmpleado().getApellidoMaternoEmpleado() : null,
            h.getFechaMovimiento(),
            h.getObservacion(),
            h.getTipoMovimiento(),
            h.getUsuario() != null ? h.getUsuario().getId() : null,
            h.getUsuario() != null ? h.getUsuario().getNombreUsuario() : null
        );
    }
}
