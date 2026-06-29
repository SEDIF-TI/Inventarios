package mx.gob.sedif.inventarios.core.AreaAdscripcion;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;


@RestController
@RequestMapping("/api/areas")
@RequiredArgsConstructor
public class AreaAdscripcionResource {

    private final AreaAdscripcionService areaService;

    @GetMapping()
    public ResponseEntity<List<AreaAdscripcionRecord>> listar() {
        return ResponseEntity.ok(areaService.listarAreas());
    }
    
}
