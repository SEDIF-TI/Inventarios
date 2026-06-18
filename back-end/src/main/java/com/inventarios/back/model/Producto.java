package com.inventarios.back.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "producto")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long pnId;

    @NotBlank
    @Column(name = "s_nombre", nullable = false)
    private String sNombre;

    @Column(name = "s_descripcion")
    private String sDescripcion;

    @NotNull
    @DecimalMin("0.0")
    @Column(name = "s_precio", nullable = false)
    private BigDecimal sPrecio;

    @NotNull
    @Min(0)
    @Column(name = "pn_stock", nullable = false)
    private Integer pnStock;

    @Column(name = "s_categoria")
    private String sCategoria;
}
