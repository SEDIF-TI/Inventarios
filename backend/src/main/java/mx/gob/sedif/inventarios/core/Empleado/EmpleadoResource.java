package mx.gob.sedif.inventarios.core.Empleado;

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




@RestController
@RequestMapping("/api/empleados")
@RequiredArgsConstructor
public class EmpleadoResource {

    private final EmpleadoService empleadoService;

    @GetMapping()
    public ResponseEntity<List<EmpleadoRecord>> listar() {
        return ResponseEntity.ok(empleadoService.listarEmpleados());
    }
    
    @PostMapping("/crear")
    public ResponseEntity<EmpleadoRecord> crear(@RequestBody EmpleadoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(empleadoService.crearEmpleado(request));
    }
    
    @PutMapping("/actualizar/{id}")
    public ResponseEntity<EmpleadoRecord> actualizar(@PathVariable Integer id, @RequestBody EmpleadoRequest request) {
        return ResponseEntity.ok(empleadoService.actualizarEmpleado(id, request));
    }
}
