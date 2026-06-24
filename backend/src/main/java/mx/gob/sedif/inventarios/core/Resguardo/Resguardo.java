package mx.gob.sedif.inventarios.core.Resguardo;

import java.math.BigDecimal;
import java.time.LocalDate;

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
import mx.gob.sedif.inventarios.core.Empleado.Empleado;

@Entity
@Getter
@Setter
@Table(name = "tbl_resguardo")
public class Resguardo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "pk_n_id_bien")
    private Integer Id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fk_n_id_area_adscripcion_bien", nullable = false)
    private AreaAdscripcion areaAdscripcion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fk_n_id_empleado", nullable = false)
    private Empleado empleado;

    @Column(name = "n_cog_bien")
    private Integer cogBien;

    @Column(name = "s_no_inventario_bien", length = 100)
    private String noInventarioBien;

    @Column(name = "s_no_interno_bien", length = 100)
    private String noInternoBien;

    @Column(name = "s_descripcion_bien", length = 100)
    private String descripcionBien;

    @Column(name = "s_estado_bien", length = 100)
    private String estadoBien;

    @Column(name = "s_marca_bien", length = 100)
    private String marcaBien;

    @Column(name = "s_modelo_bien", length = 100)
    private String modeloBien;

    @Column(name = "s_no_serie_bien", length = 100)
    private String noSerieBien;

    @Column(name = "s_material_bien", length = 100)
    private String materialBien;

    @Column(name = "s_color_bien", length = 50)
    private String colorBien;

    @Column(name = "s_factura_bien", length = 100)
    private String facturaBien;

    @Column(name = "s_entrada_bien", length = 100)
    private String entradaBien;

    @Column(name = "s_pedido_bien", length = 100)
    private String pedidoBien;

    @Column(name = "s_proveedor_bien")
    private String proveedorBien;

    @Column(name = "n_costo_bien", precision = 12, scale = 2)
    private BigDecimal costoBien;

    @Column(name = "d_fecha_asignacion_bien")
    private LocalDate fechaAsignacionBien;

    @Column(name = "s_observacion", columnDefinition = "TEXT")
    private String observacion;
    
    @Column(name = "s_observacion2", columnDefinition = "TEXT")
    private String observacion2;

    @Column(name = "b_activo", nullable = false)
    private Boolean activo = true;
}
