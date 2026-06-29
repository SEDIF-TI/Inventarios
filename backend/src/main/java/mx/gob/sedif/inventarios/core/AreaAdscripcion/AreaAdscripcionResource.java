package mx.gob.sedif.inventarios.core.AreaAdscripcion;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;


@RestController
@RequestMapping("/api/areas")
@RequiredArgsConstructor
public class AreaAdscripcionResource {

    private final AreaAdscripcionService areaService;

    @GetMapping("/listarActivas")
    public ResponseEntity<List<AreaAdscripcionRecord>> listarActivas() {
        return ResponseEntity.ok(areaService.listarAreasActivas());
    }
    
    @GetMapping("/listarTodas")
    public ResponseEntity<List<AreaAdscripcionRecord>> listarTodas() {
        return ResponseEntity.ok(areaService.listarTodas());
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

    @GetMapping("/filtrar")
    public ResponseEntity<List<AreaAdscripcionRecord>> filtrar(@RequestParam(required = false) String codigo, @RequestParam(required = false) String descripcion) {
        return ResponseEntity.ok(areaService.filtrarAreas(codigo, descripcion));
    }
    
}
