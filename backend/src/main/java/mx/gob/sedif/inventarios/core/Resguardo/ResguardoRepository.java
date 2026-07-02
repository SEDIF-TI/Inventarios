package mx.gob.sedif.inventarios.core.Resguardo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ResguardoRepository extends JpaRepository<Resguardo, Integer>, JpaSpecificationExecutor<Resguardo>{

    @Query("""
            SELECT r FROM Resguardo r
            LEFT JOIN FETCH r.areaAdscripcion
            LEFT JOIN FETCH r.empleado
        """)
    List<Resguardo> findAllConRelaciones();

    @Query("""
            SELECT r FROM Resguardo r
            LEFT JOIN FETCH r.areaAdscripcion
            LEFT JOIN FETCH r.empleado
            WHERE r.id IN :ids
        """)
    List<Resguardo> findAllByIdConRelaciones(@Param("ids") List<Integer> ids);
}
