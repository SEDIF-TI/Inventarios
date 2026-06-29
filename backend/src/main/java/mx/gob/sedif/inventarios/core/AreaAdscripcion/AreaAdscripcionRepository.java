package mx.gob.sedif.inventarios.core.AreaAdscripcion;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface AreaAdscripcionRepository extends JpaRepository<AreaAdscripcion, Integer>{
    
    @Query("SELECT a FROM AreaAdscripcion a WHERE a.areaActiva = true ORDER BY a.descripcionAreaAdscripcion")
    List<AreaAdscripcion> findAllActivas();
}
