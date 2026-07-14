package mx.gob.sedif.inventarios.core.Resguardo;

import java.time.LocalDate;

import org.springframework.format.annotation.DateTimeFormat;

import mx.gob.sedif.inventarios.util.enums.EstatusResguardo;

/**
 * Filtros opcionales de /api/resguardos. Spring los enlaza desde la query string por
 * nombre de componente, así que el controller no necesita ocho @RequestParam sueltos.
 *
 * q es la búsqueda rápida (OR entre varios campos); el resto son filtros exactos o
 * parciales que se combinan entre sí con AND.
 */
public record ResguardoFiltro(
    String q,
    Integer idArea,
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaAsignacion,
    EstatusResguardo estatus,
    String area,
    String descripcion,
    String empleado,
    String noInventario
) {}
