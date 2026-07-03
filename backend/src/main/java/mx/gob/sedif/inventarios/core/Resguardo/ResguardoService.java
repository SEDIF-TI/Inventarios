package mx.gob.sedif.inventarios.core.Resguardo;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import lombok.RequiredArgsConstructor;
import mx.gob.sedif.inventarios.core.AreaAdscripcion.AreaAdscripcion;
import mx.gob.sedif.inventarios.core.AreaAdscripcion.AreaAdscripcionRepository;
import mx.gob.sedif.inventarios.core.Empleado.Empleado;
import mx.gob.sedif.inventarios.core.Empleado.EmpleadoRepository;
import mx.gob.sedif.inventarios.core.HistorialResguardo.HistorialResguardoService;
import mx.gob.sedif.inventarios.exception.MessageConstants;
import mx.gob.sedif.inventarios.exception.ResourceNotFoundException;
import mx.gob.sedif.inventarios.util.enums.EstatusResguardo;
import mx.gob.sedif.inventarios.util.enums.Movimiento;

@Service
@RequiredArgsConstructor
public class ResguardoService {

    private final ResguardoRepository resguardoRepository;
    private final AreaAdscripcionRepository areaRepository;
    private final EmpleadoRepository empleadoRepository;
    private final HistorialResguardoService historialService;

    private static final Integer ID_UNIDAD = 151;
    private static final Integer ID_DIRECCION = 152;
    private static final Integer ID_SECCION = 166;
    private static final Integer ID_DEPTO_RECURSOS_MATERIALES = 163;

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
        Resguardo guardado = resguardoRepository.save(resguardo);

        historialService.registrarHistorial(resguardo, Movimiento.ALTA, "Alta de bien");

        return toRecord(guardado);
    }

    @Transactional
    public ResguardoRecord actualizarResguardo(Integer id, ResguardoRequest request) {
        Resguardo resguardo = resguardoRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(MessageConstants.RESGUARDO_NO_ENCONTRADO.formatted(id)));
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

    @Transactional(readOnly = true)
    public List<EtiquetaRecord> obtenerEtiquetasPorIds(List<Integer> ids) {
        return resguardoRepository.findAllByIdConRelaciones(ids).stream()
            .map(this::toRecord)
            .map(EtiquetaRecord::from)
            .toList();
    }

    @Transactional(readOnly = true)
    public List<FormatoResguardoRecord> generarFormatosResguardo(List<Integer> ids) {
        if (ids == null || ids.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Debe seleccionar al menos un bien");
        }

        List<ResguardoRecord> seleccionados = resguardoRepository.findAllByIdConRelaciones(ids)
            .stream()
            .map(this::toRecord)
            .toList();

        if (seleccionados.size() != ids.size()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                "Uno o más resguardos no existen");
        }

        // áreas fijas: se consultan una sola vez, son iguales para todos los formatos
        String unidad = obtenerNombreArea(ID_UNIDAD);
        String direccion = obtenerNombreArea(ID_DIRECCION);
        AreaFirmaRecord seccion = obtenerAreaFirma(ID_SECCION);
        AreaFirmaRecord departamentoRecursosMateriales = obtenerAreaFirma(ID_DEPTO_RECURSOS_MATERIALES);

        Map<Integer, List<ResguardoRecord>> porEmpleado = seleccionados.stream()
            .collect(Collectors.groupingBy(ResguardoRecord::idEmpleado));

        return porEmpleado.values().stream()
            .map(bienesEmpleado -> armarFormato(bienesEmpleado, unidad, direccion, seccion, departamentoRecursosMateriales))
            .toList();
    }

    @Transactional
    public ResguardoRecord darDeBaja(Integer id, String motivo) {
        Resguardo resguardo = resguardoRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(MessageConstants.RESGUARDO_NO_ENCONTRADO.formatted(id)));
        
        if (resguardo.getEstatusResguardo() == EstatusResguardo.BAJA) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El bien ya se encuentra dado de baja");
        }

        resguardo.setEstatusResguardo(EstatusResguardo.BAJA);
        resguardo.setActivo(false);
        Resguardo guardado = resguardoRepository.save(resguardo);

        historialService.registrarHistorial(resguardo, Movimiento.BAJA, motivo);

        return toRecord(guardado);
    }

    @Transactional
    public ResguardoRecord marcarDisponible(Integer id, String motivo) {
        Resguardo resguardo = resguardoRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(MessageConstants.RESGUARDO_NO_ENCONTRADO.formatted(id)));

        if (resguardo.getEstatusResguardo() == EstatusResguardo.BAJA) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "No se puede liberar un bien dado de baja");
        }

        AreaAdscripcion areaDisponible = areaRepository.findById(ID_SECCION)
            .orElseThrow(() -> new ResourceNotFoundException(MessageConstants.AREA_NO_ENCONTRADA.formatted(ID_SECCION)));

        resguardo.setEmpleado(null);
        resguardo.setAreaAdscripcion(areaDisponible);
        resguardo.setEstatusResguardo(EstatusResguardo.DISPONIBLE);
        Resguardo guardado = resguardoRepository.save(resguardo);

        historialService.registrarHistorial(resguardo, Movimiento.DISPONIBLE, motivo);

        return toRecord(guardado);
    }

    @Transactional
    public ResguardoRecord reasignar(Integer id, Integer idNuevoEmpleado, String motivo) {
        Resguardo resguardo = resguardoRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(MessageConstants.RESGUARDO_NO_ENCONTRADO.formatted(id)));

        if (resguardo.getEstatusResguardo() != EstatusResguardo.ACTIVO) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                "Solo se puede reasignar un bien que esté activo");
        }

        Empleado nuevoEmpleado = empleadoRepository.findById(idNuevoEmpleado)
            .orElseThrow(() -> new ResourceNotFoundException(MessageConstants.EMPLEADO_NO_ENCONTRADO.formatted(idNuevoEmpleado)));

        resguardo.setEmpleado(nuevoEmpleado);
        resguardo.setFechaAsignacionBien(LocalDate.now());
        Resguardo guardado = resguardoRepository.save(resguardo);

        historialService.registrarHistorial(resguardo, Movimiento.REASIGNACION, motivo);

        return toRecord(guardado);
    }

    @Transactional
    public ResguardoRecord asignar(Integer id, Integer idEmpleado, Integer idAreaAdscripcion, String motivo) {
        Resguardo resguardo = resguardoRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(MessageConstants.RESGUARDO_NO_ENCONTRADO.formatted(id)));

        if (resguardo.getEstatusResguardo() != EstatusResguardo.DISPONIBLE) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                "Solo se puede asignar un bien que esté disponible");
        }

        Empleado empleado = empleadoRepository.findById(idEmpleado)
            .orElseThrow(() -> new ResourceNotFoundException(MessageConstants.EMPLEADO_NO_ENCONTRADO.formatted(idEmpleado)));

        AreaAdscripcion area = areaRepository.findById(idAreaAdscripcion)
            .orElseThrow(() -> new ResourceNotFoundException(MessageConstants.AREA_NO_ENCONTRADA.formatted(idAreaAdscripcion)));

        resguardo.setEmpleado(empleado);
        resguardo.setAreaAdscripcion(area);
        resguardo.setEstatusResguardo(EstatusResguardo.ACTIVO);
        resguardo.setFechaAsignacionBien(LocalDate.now());
        Resguardo guardado = resguardoRepository.save(resguardo);

        historialService.registrarHistorial(resguardo, Movimiento.ASIGNACION, motivo);

        return toRecord(guardado);
    }

    //METODOS PRIVADOS
    private void mapearCampos(Resguardo resguardo, ResguardoRequest request) {
        AreaAdscripcion area = areaRepository.findById(request.idAreaAdscripcion())
            .orElseThrow(() -> new ResourceNotFoundException(MessageConstants.AREA_NO_ENCONTRADA.formatted(request.idAreaAdscripcion())));

        if (request.idEmpleado() != null) {
            Empleado empleado = empleadoRepository.findById(request.idEmpleado())
                .orElseThrow(() -> new ResourceNotFoundException(MessageConstants.EMPLEADO_NO_ENCONTRADO.formatted(request.idEmpleado())));
            resguardo.setEmpleado(empleado);
            resguardo.setEstatusResguardo(EstatusResguardo.ACTIVO);
        } else {
            resguardo.setEmpleado(null);
            resguardo.setEstatusResguardo(EstatusResguardo.DISPONIBLE);
        }

        resguardo.setAreaAdscripcion(area);
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
            r.getAreaAdscripcion() != null ? r.getAreaAdscripcion().getCodigoAreaAdscripcion() : null,
            r.getAreaAdscripcion() != null ? r.getAreaAdscripcion().getDescripcionAreaAdscripcion() : null,
            r.getEmpleado() != null ? r.getEmpleado().getId() : null,
            r.getEmpleado() != null ? r.getEmpleado().getApellidoPaternoEmpleado() + " " +
                r.getEmpleado().getApellidoMaternoEmpleado() + " " +
                r.getEmpleado().getNombreEmpleado() : null,
            r.getEmpleado() != null ? r.getEmpleado().getNoControlEmpleado() : null,
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
            r.getEstatusResguardo(),
            r.getActivo()
        );
    }

    private FormatoResguardoRecord armarFormato(List<ResguardoRecord> bienesEmpleado,
        String unidad, String direccion, AreaFirmaRecord seccion,
        AreaFirmaRecord departamentoRecursosMateriales) {

        Map<Boolean, List<BienRecord>> particion = bienesEmpleado.stream()
            .map(BienRecord::from)
            .collect(Collectors.partitioningBy(
                b -> b.noInventario() != null && b.noInventario().startsWith("NP-")
            ));

        List<BienRecord> noPatrimoniales = particion.get(true);
        List<BienRecord> patrimoniales = particion.get(false);

        ResguardoRecord primero = bienesEmpleado.get(0);

        return new FormatoResguardoRecord(
            LocalDate.now(),
            primero.codigoAreaAdscripcion(),
            primero.areaAdscripcion(),
            primero.noControlEmpleado(),
            primero.empleado(),
            unidad,
            direccion,
            seccion,
            departamentoRecursosMateriales,
            patrimoniales,
            noPatrimoniales
        );
    }

    private String obtenerNombreArea(Integer id) {
        return areaRepository.findById(id)
            .map(AreaAdscripcion::getDescripcionAreaAdscripcion)
            .orElseThrow(() -> new ResourceNotFoundException(MessageConstants.AREA_NO_ENCONTRADA.formatted(id)));
    }

    private AreaFirmaRecord obtenerAreaFirma(Integer id) {
        AreaAdscripcion area = areaRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(MessageConstants.AREA_NO_ENCONTRADA.formatted(id)));
        return new AreaFirmaRecord(area.getDescripcionAreaAdscripcion(), area.getResponsable());
    }
}
