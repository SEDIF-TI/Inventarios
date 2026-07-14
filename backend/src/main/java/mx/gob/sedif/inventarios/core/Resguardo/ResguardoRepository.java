package mx.gob.sedif.inventarios.core.Resguardo;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ResguardoRepository extends JpaRepository<Resguardo, Integer>, JpaSpecificationExecutor<Resguardo>{

    /**
     * Sin el @EntityGraph, toRecord() dispara una consulta extra por cada área y cada
     * empleado distintos de la página, porque ambas relaciones son LAZY. El grafo las
     * trae en la misma consulta.
     *
     * Ambas son a-uno, así que Hibernate resuelve el fetch join paginando en SQL; la
     * paginación en memoria solo aparecería si se hiciera fetch de una colección.
     */
    @Override
    @EntityGraph(attributePaths = {"areaAdscripcion", "empleado"})
    Page<Resguardo> findAll(Specification<Resguardo> spec, Pageable pageable);

    @Query("""
            SELECT r FROM Resguardo r
            LEFT JOIN FETCH r.areaAdscripcion
            LEFT JOIN FETCH r.empleado
            WHERE r.id IN :ids
        """)
    List<Resguardo> findAllByIdConRelaciones(@Param("ids") List<Integer> ids);
}
