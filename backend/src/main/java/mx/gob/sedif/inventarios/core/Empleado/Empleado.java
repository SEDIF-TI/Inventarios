package mx.gob.sedif.inventarios.core.Empleado;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import mx.gob.sedif.inventarios.core.AreaAdscripcion.AreaAdscripcion;

@Entity
@Getter
@Setter
@Table(name = "tbl_empleado")
public class Empleado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "pk_n_id_empleado")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fk_n_id_area_adscripcion")
    private AreaAdscripcion areaAdscripcion;

    @Column(name = "s_no_control_empleado", length = 50)
    private String noControlEmpleado;

    @Column(name = "s_nombre_empleado", nullable = false)
    private String nombreEmpleado;

    @Column(name = "s_apellido_paterno_empleado")
    private String apellidoPaternoEmpleado;

    @Column(name = "s_apellido_materno_empleado")
    private String apellidoMaternoEmpleado;

    @Column(name = "b_empleado_activo", nullable = false)
    private Boolean empleadoActivo;
}
