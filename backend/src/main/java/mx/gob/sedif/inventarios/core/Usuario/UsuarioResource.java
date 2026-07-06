package mx.gob.sedif.inventarios.core.Usuario;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import mx.gob.sedif.inventarios.util.enums.Rol;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class UsuarioResource {

    private final UsuarioService usuarioService;

    @GetMapping()
    public ResponseEntity<List<UsuarioRecord>> listar() {
        return ResponseEntity.ok(usuarioService.listarUsuarios());
    }

    @PostMapping("/crear")
    public ResponseEntity<UsuarioRecord> crear(@RequestBody UsuarioRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(usuarioService.crearUsuario(request));
    }

    @PutMapping("/actualizar/{id}")
    public ResponseEntity<UsuarioRecord> actualizar(@PathVariable Integer id, @RequestBody UsuarioRequest request) {
        return ResponseEntity.ok(usuarioService.actualizarUsuario(id, request));
    }

    @GetMapping("/filtrar")
    public ResponseEntity<List<UsuarioRecord>> filtrar(
        @RequestParam(required = false) String nombreUsuario,
        @RequestParam(required = false) Rol rol,
        @RequestParam(required = false) Boolean activo
    ) {
        return ResponseEntity.ok(usuarioService.filtrarUsuarios(nombreUsuario, rol, activo));
    }
}
