package mx.gob.sedif.inventarios.util;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

public final class Paginacion {

    private static final String ID = "id";

    private Paginacion() {}

    public static Pageable conOrden(Pageable pageable) {
        return conOrden(pageable, Sort.by(Sort.Order.asc(ID)));
    }

    /**
     * Garantiza un orden total sobre el resultado.
     *
     * Sin desempate por clave primaria el orden de dos filas con la misma clave de
     * ordenamiento no está definido, y Postgres es libre de devolverlas en distinto
     * orden entre peticiones: la misma fila puede salir en dos páginas o en ninguna.
     * Por eso el desempate es un prerequisito de la paginación, no un adorno.
     *
     * @param porDefecto orden a aplicar cuando el cliente no manda ninguno.
     */
    public static Pageable conOrden(Pageable pageable, Sort porDefecto) {
        Sort base = pageable.getSort().isSorted() ? pageable.getSort() : porDefecto;

        Sort orden = base.stream().anyMatch(o -> ID.equals(o.getProperty()))
            ? base
            : base.and(Sort.by(direccionDelPrincipal(base), ID));

        return PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), orden);
    }

    /** El desempate hereda la dirección del criterio principal (ej. historial: fecha DESC, id DESC). */
    private static Sort.Direction direccionDelPrincipal(Sort base) {
        return base.stream()
            .findFirst()
            .map(Sort.Order::getDirection)
            .orElse(Sort.Direction.ASC);
    }
}
