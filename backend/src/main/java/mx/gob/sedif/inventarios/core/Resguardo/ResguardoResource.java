package mx.gob.sedif.inventarios.core.Resguardo;

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
@RequestMapping("/api/resguardos")
@RequiredArgsConstructor
public class ResguardoResource {

    private final ResguardoService resguardoService;

    @GetMapping()
    public ResponseEntity<List<ResguardoRecord>> listar() {
        return ResponseEntity.ok(resguardoService.listarResguardos());
    }
    
    @PostMapping("/crear")
    public ResponseEntity<ResguardoRecord> crear(@RequestBody ResguardoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(resguardoService.crearResguardo(request));
    }

    @PutMapping("/actualizar/{id}")
    public ResponseEntity<ResguardoRecord> actualizar(@PathVariable Integer id, @RequestBody ResguardoRequest request) {
        return ResponseEntity.ok(resguardoService.actualizarResguardo(id, request));
    }

    @GetMapping("/filtrar")
    public ResponseEntity<List<ResguardoRecord>> filtrar(
        @RequestParam(required = false) String area,
        @RequestParam(required = false) String descripcion,
        @RequestParam(required = false) String empleado,
        @RequestParam(required = false) String noInventario
    ) {
        return ResponseEntity.ok(resguardoService.filtrarResguardos(area, descripcion, empleado, noInventario));
    }
    
    @GetMapping("/etiquetas")
    public ResponseEntity<List<EtiquetaRecord>> obtenerEtiquetas(
        @RequestParam List<Integer> ids
    ) {
        return ResponseEntity.ok(resguardoService.obtenerEtiquetasPorIds(ids));
    }

    @GetMapping("/formato")
    public ResponseEntity<List<FormatoResguardoRecord>> obtenerFormato(
        @RequestParam List<Integer> ids
    ) {
        return ResponseEntity.ok(resguardoService.generarFormatosResguardo(ids));
    }
}
