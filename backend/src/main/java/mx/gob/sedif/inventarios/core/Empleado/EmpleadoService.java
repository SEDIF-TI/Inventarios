package mx.gob.sedif.inventarios.core.Empleado;

import java.util.List;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import mx.gob.sedif.inventarios.core.AreaAdscripcion.AreaAdscripcion;
import mx.gob.sedif.inventarios.core.AreaAdscripcion.AreaAdscripcionRepository;
import mx.gob.sedif.inventarios.exception.MessageConstants;
import mx.gob.sedif.inventarios.exception.ResourceNotFoundException;
import mx.gob.sedif.inventarios.util.PagedResponse;
import mx.gob.sedif.inventarios.util.Paginacion;

@Service
@RequiredArgsConstructor
public class EmpleadoService {

    private final EmpleadoRepository empleadoRepository;
    private final AreaAdscripcionRepository areaAdscripcionRepository;

    @Transactional(readOnly = true)
    public PagedResponse<EmpleadoRecord> buscarEmpleados(
        String q, String nombre, String apellidoPaterno, String apellidoMaterno,
        String noControl, String area, Boolean activo, Pageable pageable
    ) {
        Specification<Empleado> spec = Specification.allOf(
            EmpleadoSpec.porBusqueda(q),
            EmpleadoSpec.porActivo(activo),
            EmpleadoSpec.porNombre(nombre),
            EmpleadoSpec.porApellidoPaterno(apellidoPaterno),
            EmpleadoSpec.porApellidoMaterno(apellidoMaterno),
            EmpleadoSpec.porNoControl(noControl),
            EmpleadoSpec.porArea(area)
        );

        return PagedResponse.from(
            empleadoRepository.findAll(spec, Paginacion.conOrden(pageable)).map(this::toRecord)
        );
    }

    @Transactional
    @CacheEvict(value = "empleadosActivos", allEntries = true)
    public EmpleadoRecord crearEmpleado(EmpleadoRequest request) {
        Empleado empleado = new Empleado();
        mapearCampos(empleado, request);
        return toRecord(empleadoRepository.save(empleado));
    }

    @Transactional
    @CacheEvict(value = "empleadosActivos", allEntries = true)
    public EmpleadoRecord actualizarEmpleado(Integer id, EmpleadoRequest request){
        Empleado empleado = empleadoRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(MessageConstants.EMPLEADO_NO_ENCONTRADO.formatted(id)));

        mapearCampos(empleado,request);
        return toRecord(empleadoRepository.save(empleado));
    }

    @Transactional(readOnly = true)
    @Cacheable("empleadosActivos")
    public List<EmpleadoRecord> listarEmpleadosActivos() {
        return empleadoRepository.findAllActivos().stream()
            .map(this::toRecord)
            .toList();
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
                .orElseThrow(() -> new ResourceNotFoundException(MessageConstants.AREA_NO_ENCONTRADA.formatted(request.idAreaAdscripcion())));
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
