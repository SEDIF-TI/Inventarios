package mx.gob.sedif.inventarios.core.AreaAdscripcion;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
import org.springframework.web.bind.annotation.RequestParam;

import mx.gob.sedif.inventarios.util.PagedResponse;


@RestController
@RequestMapping("/api/areas")
@RequiredArgsConstructor
public class AreaAdscripcionResource {

    private final AreaAdscripcionService areaService;

    /** Listado paginado. Absorbe /listarTodas y /filtrar: todos los filtros son opcionales. */
    @GetMapping()
    public ResponseEntity<PagedResponse<AreaAdscripcionRecord>> buscar(
        @RequestParam(required = false) String q,
        @RequestParam(required = false) String codigo,
        @RequestParam(required = false) String descripcion,
        @RequestParam(required = false) Boolean activa,
        Pageable pageable
    ) {
        return ResponseEntity.ok(areaService.buscarAreas(q, codigo, descripcion, activa, pageable));
    }

    /** Catálogo para los selects del front: no pagina a propósito (ver AreaAdscripcionRepository). */
    @GetMapping("/listarActivas")
    public ResponseEntity<List<AreaAdscripcionRecord>> listarActivas() {
        return ResponseEntity.ok(areaService.listarAreasActivas());
    }

    @PostMapping("/crear")
    public ResponseEntity<AreaAdscripcionRecord> crear(@RequestBody  AreaAdscripcionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(areaService.crearArea(request));
    }

    @PutMapping("/actualizar/{id}")
    public ResponseEntity<AreaAdscripcionRecord> actualizar(@PathVariable Integer id, @RequestBody AreaAdscripcionRequest request) {
        return ResponseEntity.ok(areaService.actualizarArea(id, request));
    }
}
