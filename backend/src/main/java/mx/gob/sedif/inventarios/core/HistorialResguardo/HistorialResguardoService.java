package mx.gob.sedif.inventarios.core.HistorialResguardo;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import mx.gob.sedif.inventarios.core.Resguardo.Resguardo;
import mx.gob.sedif.inventarios.core.Usuario.UsuarioRepository;
import mx.gob.sedif.inventarios.util.PagedResponse;
import mx.gob.sedif.inventarios.util.Paginacion;
import mx.gob.sedif.inventarios.util.enums.Movimiento;

@Service
@RequiredArgsConstructor
public class HistorialResguardoService {

    private final HistorialResguardoRepository historialRepository;
    private final UsuarioRepository usuarioRepository;

    /** Orden por defecto: lo más reciente primero, que es como se lee un historial. */
    private static final Sort MAS_RECIENTE_PRIMERO = Sort.by(Sort.Order.desc("fechaMovimiento"));

    @Transactional(readOnly = true)
    public PagedResponse<HistorialResguardoRecord> buscarHistorial(
        Integer idResguardo, Movimiento tipoMovimiento, LocalDate fechaDesde, LocalDate fechaHasta,
        String q, Pageable pageable
    ) {
        Specification<HistorialResguardo> spec = Specification.allOf(
            HistorialResguardoSpec.porIdResguardo(idResguardo),
            HistorialResguardoSpec.porTipoMovimiento(tipoMovimiento),
            HistorialResguardoSpec.desde(fechaDesde),
            HistorialResguardoSpec.hasta(fechaHasta),
            HistorialResguardoSpec.porBusqueda(q)
        );

        return PagedResponse.from(
            historialRepository.findAll(spec, Paginacion.conOrden(pageable, MAS_RECIENTE_PRIMERO))
                .map(this::toRecord)
        );
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
