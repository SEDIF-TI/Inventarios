package mx.gob.sedif.inventarios.core.Usuario;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import mx.gob.sedif.inventarios.exception.DuplicateResourceException;
import mx.gob.sedif.inventarios.exception.InvalidOperationException;
import mx.gob.sedif.inventarios.exception.MessageConstants;
import mx.gob.sedif.inventarios.exception.ResourceNotFoundException;
import mx.gob.sedif.inventarios.util.PagedResponse;
import mx.gob.sedif.inventarios.util.Paginacion;
import mx.gob.sedif.inventarios.util.enums.Rol;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public PagedResponse<UsuarioRecord> buscarUsuarios(
        String q, String nombreUsuario, Rol rol, Boolean activo, Pageable pageable
    ) {
        Specification<Usuario> spec = Specification.allOf(
            UsuarioSpec.porBusqueda(q),
            UsuarioSpec.porNombreUsuario(nombreUsuario),
            UsuarioSpec.porRol(rol),
            UsuarioSpec.porActivo(activo)
        );

        return PagedResponse.from(
            usuarioRepository.findAll(spec, Paginacion.conOrden(pageable)).map(this::toRecord)
        );
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
        validarAsignacionRol(request.rol());

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
            validarAsignacionRol(request.rol());
            usuario.setRol(request.rol());
        }
        if (request.activo() != null) {
            usuario.setActivo(request.activo());
        }

        return toRecord(usuarioRepository.save(usuario));
    }

    //METODOS PRIVADOS-----

    private void validarAsignacionRol(Rol rolSolicitado) {
        String nombreActual = SecurityContextHolder.getContext().getAuthentication().getName();
        Usuario actual = usuarioRepository.findByNombreUsuario(nombreActual)
            .orElseThrow(() -> new ResourceNotFoundException(MessageConstants.USUARIO_NO_ENCONTRADO));

        if (actual.getRol() == Rol.ADMIN && rolSolicitado == Rol.SUPERADMIN) {
            throw new InvalidOperationException(
                MessageConstants.ROL_NO_PERMITIDO.formatted(rolSolicitado));
        }
    }

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
