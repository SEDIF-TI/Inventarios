package mx.gob.sedif.inventarios.core.HistorialResguardo;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;


@RestController
@RequestMapping("/api/Historial")
@RequiredArgsConstructor
public class HistorialResguardoResource {

    private final HistorialResguardoService historialService;

    @GetMapping()
    public ResponseEntity<List<HistorialResguardoRecord>> listar() {
        return ResponseEntity.ok(historialService.listarHistorial());
    }
    
}
