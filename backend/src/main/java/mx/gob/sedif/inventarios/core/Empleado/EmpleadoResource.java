package mx.gob.sedif.inventarios.core.Empleado;

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
@RequestMapping("/api/empleados")
@RequiredArgsConstructor
public class EmpleadoResource {

    private final EmpleadoService empleadoService;

    /** Listado paginado. Absorbe el antiguo /filtrar: todos los filtros son opcionales. */
    @GetMapping()
    public ResponseEntity<PagedResponse<EmpleadoRecord>> buscar(
        @RequestParam(required = false) String q,
        @RequestParam(required = false) String nombre,
        @RequestParam(required = false) String apellidoPaterno,
        @RequestParam(required = false) String apellidoMaterno,
        @RequestParam(required = false) String noControl,
        @RequestParam(required = false) String area,
        @RequestParam(required = false) Boolean activo,
        Pageable pageable
    ) {
        return ResponseEntity.ok(empleadoService.buscarEmpleados(
            q, nombre, apellidoPaterno, apellidoMaterno, noControl, area, activo, pageable));
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

    /** Catálogo para los selects del front: no pagina a propósito (ver EmpleadoRepository). */
    @GetMapping("/listarActivos")
    public ResponseEntity<List<EmpleadoRecord>> listarActivos() {
        return ResponseEntity.ok(empleadoService.listarEmpleadosActivos());
    }
}
