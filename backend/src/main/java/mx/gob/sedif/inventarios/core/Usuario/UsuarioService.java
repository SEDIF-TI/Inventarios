package mx.gob.sedif.inventarios.core.Usuario;

import java.util.List;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import mx.gob.sedif.inventarios.exception.DuplicateResourceException;
import mx.gob.sedif.inventarios.exception.InvalidOperationException;
import mx.gob.sedif.inventarios.exception.MessageConstants;
import mx.gob.sedif.inventarios.exception.ResourceNotFoundException;
import mx.gob.sedif.inventarios.util.enums.Rol;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<UsuarioRecord> listarUsuarios() {
        return usuarioRepository.findAll().stream()
            .map(this::toRecord)
            .toList();
    }

    @Transactional
    public UsuarioRecord crearUsuario(UsuarioRequest request) {
        if (request.password() == null || request.password().isBlank()) {
            throw new InvalidOperationException("La contraseña es obligatoria");
        }
        if (usuarioRepository.findByNombreUsuario(request.nombreUsuario()).isPresent()) {
            throw new DuplicateResourceException(
                MessageConstants.USUARIO_DUPLICADO.formatted(request.nombreUsuario()));
        }

        Usuario usuario = new Usuario();
        mapearCampos(usuario, request);
        usuario.setPassword(passwordEncoder.encode(request.password()));
        return toRecord(usuarioRepository.save(usuario));
    }

    @Transactional
    public UsuarioRecord actualizarUsuario(Integer id, UsuarioRequest request) {
        Usuario usuario = usuarioRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(MessageConstants.USUARIO_NO_ENCONTRADO_ID.formatted(id)));

        if (request.nombreUsuario() != null && !request.nombreUsuario().equals(usuario.getNombreUsuario())
            && usuarioRepository.findByNombreUsuario(request.nombreUsuario()).isPresent()) {
            throw new DuplicateResourceException(
                MessageConstants.USUARIO_DUPLICADO.formatted(request.nombreUsuario()));
        }

        if (request.nombreUsuario() != null) {
            usuario.setNombreUsuario(request.nombreUsuario());
        }
        if (request.password() != null && !request.password().isBlank()) {
            usuario.setPassword(passwordEncoder.encode(request.password()));
        }
        if (request.rol() != null) {
            usuario.setRol(request.rol());
        }
        if (request.activo() != null) {
            usuario.setActivo(request.activo());
        }

        return toRecord(usuarioRepository.save(usuario));
    }

    @Transactional(readOnly = true)
    public List<UsuarioRecord> filtrarUsuarios(String nombreUsuario, Rol rol, Boolean activo) {
        Specification<Usuario> spec = Specification
            .where(UsuarioSpec.porNombreUsuario(nombreUsuario))
            .and(UsuarioSpec.porRol(rol))
            .and(UsuarioSpec.porActivo(activo));

        return usuarioRepository.findAll(spec).stream()
            .map(this::toRecord)
            .toList();
    }

    //METODOS PRIVADOS-----

    private void mapearCampos(Usuario usuario, UsuarioRequest request) {
        usuario.setNombreUsuario(request.nombreUsuario());
        usuario.setRol(request.rol());
        usuario.setActivo(request.activo());
    }

    private UsuarioRecord toRecord(Usuario u) {
        return new UsuarioRecord(
            u.getId(),
            u.getNombreUsuario(),
            u.getRol(),
            u.getActivo()
        );
    }
}
