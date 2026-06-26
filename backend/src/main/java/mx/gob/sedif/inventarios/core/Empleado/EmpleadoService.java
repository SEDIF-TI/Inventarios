package mx.gob.sedif.inventarios.core.Empleado;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import mx.gob.sedif.inventarios.core.AreaAdscripcion.AreaAdscripcion;
import mx.gob.sedif.inventarios.core.AreaAdscripcion.AreaAdscripcionRepository;

@Service
@RequiredArgsConstructor
public class EmpleadoService {

    private final EmpleadoRepository empleadoRepository;
    private final AreaAdscripcionRepository areaAdscripcionRepository;

    @Transactional(readOnly = true)
    public List<EmpleadoRecord> listarEmpleados() {
        return empleadoRepository.findAllConArea().stream()
            .map(this::toRecord)
            .toList();
    }

    @Transactional
    public EmpleadoRecord crearEmpleado(EmpleadoRequest request) {
        Empleado empleado = new Empleado();
        mapearCampos(empleado, request);
        return toRecord(empleadoRepository.save(empleado));
    }

    @Transactional
    public EmpleadoRecord actualizarEmpleado(Integer id, EmpleadoRequest request){
        Empleado empleado = empleadoRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Empleado no encontrado con id: " + id));
        
        mapearCampos(empleado,request);
        return toRecord(empleadoRepository.save(empleado));
    }

    //METODOS PRIVADOS-----

    private void mapearCampos(Empleado empleado, EmpleadoRequest request) {
        empleado.setNoControlEmpleado(request.noControlEmpleado());
        empleado.setNombreEmpleado(request.nombreEmpleado());
        empleado.setApellidoPaternoEmpleado(request.apellidoPaternoEmpleado());
        empleado.setApellidoMaternoEmpleado(request.apellidoMaternoEmpleado());
        empleado.setEmpleadoActivo(request.empleadoActivo());

        if (request.idAreaAdscripcion() != null) {
            AreaAdscripcion area = areaAdscripcionRepository.findById(request.idAreaAdscripcion())
                .orElseThrow(() -> new RuntimeException("Área no encontrada con id: " + request.idAreaAdscripcion()));
            empleado.setAreaAdscripcion(area);
        } else {
            empleado.setAreaAdscripcion(null);
        }
    }

    private EmpleadoRecord toRecord(Empleado e) {
        return new EmpleadoRecord(
            e.getId(),
            e.getNoControlEmpleado(),
            e.getNombreEmpleado(),
            e.getApellidoPaternoEmpleado(),
            e.getApellidoMaternoEmpleado(),
            e.getAreaAdscripcion() != null ? e.getAreaAdscripcion().getDescripcionAreaAdscripcion() : null,
            e.getEmpleadoActivo()
        );
    }
}
