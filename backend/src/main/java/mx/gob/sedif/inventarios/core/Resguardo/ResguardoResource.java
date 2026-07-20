package mx.gob.sedif.inventarios.core.Resguardo;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;

import mx.gob.sedif.inventarios.util.PagedResponse;


/**
 * API REST de resguardos (bienes muebles).
 *
 * <p>No existe {@code DELETE}: la baja es siempre lógica ({@code PUT /{id}/baja}),
 * que marca el bien como {@code EstatusResguardo.BAJA} y registra el movimiento
 * en el historial. Esta decisión es intencional: los bienes dados de baja deben
 * conservarse para auditoría y para el historial de resguardos.
 */
@RestController
@RequestMapping("/api/resguardos")
@RequiredArgsConstructor
public class ResguardoResource {

    private final ResguardoService resguardoService;

    @GetMapping()
    public ResponseEntity<PagedResponse<ResguardoRecord>> buscar(ResguardoFiltro filtro, Pageable pageable) {
        return ResponseEntity.ok(resguardoService.buscarResguardos(filtro, pageable));
    }

    @PostMapping("/crear")
    public ResponseEntity<ResguardoRecord> crear(@Valid @RequestBody ResguardoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(resguardoService.crearResguardo(request));
    }

    @PutMapping("/actualizar/{id}")
    public ResponseEntity<ResguardoRecord> actualizar(@PathVariable Integer id, @Valid @RequestBody ResguardoRequest request) {
        return ResponseEntity.ok(resguardoService.actualizarResguardo(id, request));
    }

    @PostMapping("/etiquetas")
    public ResponseEntity<List<EtiquetaRecord>> obtenerEtiquetas(
        @Valid @RequestBody IdsRequest request
    ) {
        return ResponseEntity.ok(resguardoService.obtenerEtiquetasPorIds(request.ids()));
    }

    @PostMapping("/formato")
    public ResponseEntity<List<FormatoResguardoRecord>> obtenerFormato(
        @Valid @RequestBody IdsRequest request
    ) {
        return ResponseEntity.ok(resguardoService.generarFormatosResguardo(request.ids()));
    }

    @PutMapping("/{id}/asignar")
    public ResponseEntity<ResguardoRecord> asignar(
        @PathVariable Integer id,
        @Valid @RequestBody AsignarRequest request
    ) {
        return ResponseEntity.ok(resguardoService.asignar(id, request.idEmpleado(), request.idAreaAdscripcion(), request.motivo()));
    }

    @PutMapping("/{id}/baja")
    public ResponseEntity<ResguardoRecord> darDeBaja(
        @PathVariable Integer id,
        @Valid @RequestBody MotivoRequest request
    ) {
        return ResponseEntity.ok(resguardoService.darDeBaja(id, request.motivo()));
    }

    @PutMapping("/{id}/disponible")
    public ResponseEntity<ResguardoRecord> marcarDisponible(
        @PathVariable Integer id,
        @Valid @RequestBody MotivoRequest request
    ) {
        return ResponseEntity.ok(resguardoService.marcarDisponible(id, request.motivo()));
    }

    @PutMapping("/reasignar-lote")
    public ResponseEntity<ReasignarLoteResponse> reasignarLote(
        @Valid @RequestBody ReasignarLoteRequest request
    ) {
        return ResponseEntity.ok(
            resguardoService.reasignarLote(request.ids(), request.idNuevoEmpleado(), request.motivo()));
    }

    @PutMapping("/{id}/reasignar")
    public ResponseEntity<ResguardoRecord> reasignar(
        @PathVariable Integer id,
        @Valid @RequestBody ReasignarRequest request
    ) {
        return ResponseEntity.ok(resguardoService.reasignar(id, request.idNuevoEmpleado(), request.motivo()));
    }
}
