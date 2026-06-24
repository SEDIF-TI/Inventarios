package mx.gob.sedif.inventarios.core.Usuario;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import mx.gob.sedif.inventarios.util.enums.Rol;

@Entity
@Getter
@Setter
@Table(name = "tbl_usuario")
public class Usuario {

    @Id
    @Column(name = "pk_n_id_usuario")
    private Integer id;

    @Column(name = "s_nombre_usuario")
    private String nombreUsuario;

    @Column(name = "s_password")
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(name = "n_rol", nullable = false)
    private Rol rol;

    @Column(name = "b_activo")
    private Boolean activo;
}
