package mx.gob.sedif.inventarios.core.Empleado;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface EmpleadoRepository extends JpaRepository<Empleado, Integer>{

    @Query("SELECT e FROM Empleado e LEFT JOIN FETCH e.areaAdscripcion")
    List<Empleado> findAllConArea();
}
