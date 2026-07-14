package mx.gob.sedif.inventarios.core.Empleado;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

public interface EmpleadoRepository extends JpaRepository<Empleado, Integer>, JpaSpecificationExecutor<Empleado>{

    /** El grafo evita una consulta extra por cada área distinta de la página (areaAdscripcion es LAZY). */
    @Override
    @EntityGraph(attributePaths = "areaAdscripcion")
    Page<Empleado> findAll(Specification<Empleado> spec, Pageable pageable);

    /**
     * Catálogo para los selects del front: devuelve la lista completa a propósito, porque
     * un desplegable necesita todas las opciones, no una página. Es la excepción consciente
     * a la paginación, y solo se sostiene mientras el número de empleados activos sea del
     * orden de centenares; a partir de unos pocos miles hay que sustituirlo por un
     * autocompletado que busque contra el servidor.
     */
    @Query("SELECT e FROM Empleado e LEFT JOIN FETCH e.areaAdscripcion WHERE e.empleadoActivo = true ORDER BY e.apellidoPaternoEmpleado, e.apellidoMaternoEmpleado, e.nombreEmpleado, e.id")
    List<Empleado> findAllActivos();
}
