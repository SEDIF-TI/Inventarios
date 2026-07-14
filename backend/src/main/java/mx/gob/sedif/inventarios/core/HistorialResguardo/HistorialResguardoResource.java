package mx.gob.sedif.inventarios.core.HistorialResguardo;

import java.time.LocalDate;

import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import mx.gob.sedif.inventarios.util.PagedResponse;
import mx.gob.sedif.inventarios.util.enums.Movimiento;

@RestController
@RequestMapping("/api/historial")
@RequiredArgsConstructor
public class HistorialResguardoResource {

    private final HistorialResguardoService historialService;

    @GetMapping()
    public ResponseEntity<PagedResponse<HistorialResguardoRecord>> buscar(
        @RequestParam(required = false) Integer idResguardo,
        @RequestParam(required = false) Movimiento tipoMovimiento,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaDesde,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaHasta,
        @RequestParam(required = false) String q,
        Pageable pageable
    ) {
        return ResponseEntity.ok(
            historialService.buscarHistorial(idResguardo, tipoMovimiento, fechaDesde, fechaHasta, q, pageable));
    }
}
