package mx.gob.sedif.inventarios.core.Resguardo;

import java.util.List;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import mx.gob.sedif.inventarios.core.AreaAdscripcion.AreaAdscripcion;
import mx.gob.sedif.inventarios.core.AreaAdscripcion.AreaAdscripcionRepository;
import mx.gob.sedif.inventarios.core.Empleado.Empleado;
import mx.gob.sedif.inventarios.core.Empleado.EmpleadoRepository;

@Service
@RequiredArgsConstructor
public class ResguardoService {

    private final ResguardoRepository resguardoRepository;
    private final AreaAdscripcionRepository areaRepository;
    private final EmpleadoRepository empleadoRepository;

    @Transactional(readOnly = true)
    public List<ResguardoRecord> listarResguardos() {
        return resguardoRepository.findAllConRelaciones().stream()
            .map(this::toRecord)
            .toList();
    }

    @Transactional
    public ResguardoRecord crearResguardo(ResguardoRequest request) {
        Resguardo resguardo = new Resguardo();
        mapearCampos(resguardo, request);
        return toRecord(resguardoRepository.save(resguardo));
    }

    @Transactional
    public ResguardoRecord actualizarResguardo(Integer id, ResguardoRequest request) {
        Resguardo resguardo = resguardoRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Resguardo no encontrado con id: " + id));
        mapearCampos(resguardo, request);
        return toRecord(resguardoRepository.save(resguardo));
    }

    @Transactional(readOnly = true)
    public List<ResguardoRecord> filtrarResguardos(String area, String descripcion, String empleado, String noInventario) {
        Specification<Resguardo> spec = Specification
            .where(ResguardoSpec.porArea(area))
            .and(ResguardoSpec.porDescripcion(descripcion))
            .and(ResguardoSpec.porEmpleado(empleado))
            .and(ResguardoSpec.porNoInventario(noInventario));
        
        return resguardoRepository.findAll(spec).stream()
            .map(this::toRecord)
            .toList();
    }

    //METODOS PRIVADOS
    private void mapearCampos(Resguardo resguardo, ResguardoRequest request) {
        AreaAdscripcion area = areaRepository.findById(request.idAreaAdscripcion())
            .orElseThrow(() -> new RuntimeException("Área no encontrada con id: " + request.idAreaAdscripcion()));

        Empleado empleado = empleadoRepository.findById(request.idEmpleado())
            .orElseThrow(() -> new RuntimeException("Empleado no encontrado con id: " + request.idEmpleado()));

        resguardo.setAreaAdscripcion(area);
        resguardo.setEmpleado(empleado);
        resguardo.setCogBien(request.cogBien());
        resguardo.setNoInventarioBien(request.noInventarioBien());
        resguardo.setNoInternoBien(request.noInternoBien());
        resguardo.setDescripcionBien(request.descripcionBien());
        resguardo.setEstadoBien(request.estadoBien());
        resguardo.setMarcaBien(request.marcaBien());
        resguardo.setModeloBien(request.modeloBien());
        resguardo.setNoSerieBien(request.noSerieBien());
        resguardo.setMaterialBien(request.materialBien());
        resguardo.setColorBien(request.colorBien());
        resguardo.setFacturaBien(request.facturaBien());
        resguardo.setEntradaBien(request.entradaBien());
        resguardo.setPedidoBien(request.pedidoBien());
        resguardo.setProveedorBien(request.proveedorBien());
        resguardo.setCostoBien(request.costoBien());
        resguardo.setFechaAsignacionBien(request.fechaAsignacionBien());
        resguardo.setObservacion(request.observacion());
        resguardo.setObservacion2(request.observacion2());
        resguardo.setActivo(request.activo() != null ? request.activo() : true);
    }

    private ResguardoRecord toRecord(Resguardo r) {
        return new ResguardoRecord(
            r.getId(),
            r.getAreaAdscripcion() != null ? r.getAreaAdscripcion().getId() : null,
            r.getAreaAdscripcion() != null ? r.getAreaAdscripcion().getDescripcionAreaAdscripcion() : null,
            r.getEmpleado() != null ? r.getEmpleado().getId() : null,
            r.getEmpleado() != null ? r.getEmpleado().getNombreEmpleado() + " " +
                r.getEmpleado().getApellidoPaternoEmpleado() + " " +
                r.getEmpleado().getApellidoMaternoEmpleado() : null,
            r.getCogBien(),
            r.getNoInventarioBien(),
            r.getNoInternoBien(),
            r.getDescripcionBien(),
            r.getEstadoBien(),
            r.getMarcaBien(),
            r.getModeloBien(),
            r.getNoSerieBien(),
            r.getMaterialBien(),
            r.getColorBien(),
            r.getFacturaBien(),
            r.getEntradaBien(),
            r.getPedidoBien(),
            r.getProveedorBien(),
            r.getCostoBien(),
            r.getFechaAsignacionBien(),
            r.getObservacion(),
            r.getObservacion2(),
            r.getActivo()
        );
    }
}
