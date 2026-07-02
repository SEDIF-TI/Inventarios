package mx.gob.sedif.inventarios.core.AreaAdscripcion;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "tbl_area_adscripcion")
public class AreaAdscripcion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "pk_n_id_area_adscripcion")
    private Integer id;

    @Column(name = "s_codigo_area_adscripcion", nullable = false, length = 50)
    private String codigoAreaAdscripcion;

    @Column(name = "s_descripcion_area_adscripcion", nullable = false)
    private String descripcionAreaAdscripcion;

    @Column(name = "b_area_activa", nullable = false)
    private Boolean areaActiva = true;

    @Column(name = "s_responsable")
    private String responsable;
}
