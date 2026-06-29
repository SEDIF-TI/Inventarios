package mx.gob.sedif.inventarios.core.Resguardo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ResguardoRepository extends JpaRepository<Resguardo, Integer>{

    @Query("""
            SELECT r FROM Resguardo r
            LEFT JOIN FETCH r.areaAdscripcion
            LEFT JOIN FETCH r.empleado
        """)
    List<Resguardo> findAllConRelaciones();
}
