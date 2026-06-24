package mx.gob.sedif.inventarios.core.Usuario;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface UsuarioRepository extends JpaRepository<Usuario, Integer>{

    Optional<Usuario> findByNombreUsuario(String nombreUsuario);
}
