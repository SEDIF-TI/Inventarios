package mx.gob.sedif.inventarios.core.AreaAdscripcion;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

public interface AreaAdscripcionRepository extends JpaRepository<AreaAdscripcion, Integer>, JpaSpecificationExecutor<AreaAdscripcion>{
    
    /**
     * Catálogo para los selects del front: devuelve la lista completa a propósito, porque un
     * desplegable necesita todas las opciones, no una página. Las áreas son un catálogo casi
     * estático del orden de centenares, así que el volcado es asumible.
     */
    @Query("SELECT a FROM AreaAdscripcion a WHERE a.areaActiva = true ORDER BY a.descripcionAreaAdscripcion, a.id")
    List<AreaAdscripcion> findAllActivas();
}
