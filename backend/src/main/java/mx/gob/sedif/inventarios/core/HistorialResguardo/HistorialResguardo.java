package mx.gob.sedif.inventarios.core.HistorialResguardo;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
import mx.gob.sedif.inventarios.core.Empleado.Empleado;
import mx.gob.sedif.inventarios.core.Resguardo.Resguardo;
import mx.gob.sedif.inventarios.util.enums.Movimiento;

@Entity
@Getter
@Setter
@Table(name = "tbl_historial_resguardo")
public class HistorialResguardo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "pk_n_id_historial")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fk_n_id_bien", nullable = false)
    private Resguardo resguardo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fk_n_id_area", nullable = false)
    private AreaAdscripcion areaAdscripcion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fk_n_id_empleado", nullable = false)
    private Empleado empleado;

    @Column(name = "d_fecha_movimiento", nullable = false)
    private LocalDateTime fechaMovimiento;

    @Column(name = "s_observacion", columnDefinition = "TEXT")
    private String observacion;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "s_tipo_movimiento", nullable = false, length = 50)
    private Movimiento tipoMovimiento;
}
