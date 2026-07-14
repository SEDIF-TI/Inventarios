package mx.gob.sedif.inventarios.core.HistorialResguardo;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface HistorialResguardoRepository
    extends JpaRepository<HistorialResguardo, Integer>, JpaSpecificationExecutor<HistorialResguardo> {

    /**
     * De todas las tablas del sistema, esta es la única que crece de forma monótona: cada
     * alta, baja, asignación y reasignación inserta una fila y nada se purga jamás. Aquí la
     * paginación no es una optimización, es un requisito.
     *
     * Las cuatro relaciones son a-uno, así que el grafo se resuelve con fetch joins en la
     * misma consulta y Hibernate sigue paginando en SQL.
     */
    @Override
    @EntityGraph(attributePaths = {"resguardo", "areaAdscripcion", "empleado", "usuario"})
    Page<HistorialResguardo> findAll(Specification<HistorialResguardo> spec, Pageable pageable);
}
