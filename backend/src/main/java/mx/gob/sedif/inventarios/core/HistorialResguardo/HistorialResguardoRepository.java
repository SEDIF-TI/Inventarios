package mx.gob.sedif.inventarios.core.HistorialResguardo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface HistorialResguardoRepository extends JpaRepository<HistorialResguardo, Integer>{
    
    @Query("""
        SELECT h FROM HistorialResguardo h
        LEFT JOIN FETCH h.resguardo
        LEFT JOIN FETCH h.areaAdscripcion
        LEFT JOIN FETCH h.empleado
        ORDER BY h.fechaMovimiento DESC
    """)
    List<HistorialResguardo> findAllConRelaciones();
}