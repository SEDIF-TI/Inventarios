package mx.gob.sedif.inventarios.core.Resguardo;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import mx.gob.sedif.inventarios.exception.InvalidOperationException;

import lombok.RequiredArgsConstructor;
import mx.gob.sedif.inventarios.core.AreaAdscripcion.AreaAdscripcion;
import mx.gob.sedif.inventarios.core.AreaAdscripcion.AreaAdscripcionRepository;
import mx.gob.sedif.inventarios.core.Empleado.Empleado;
import mx.gob.sedif.inventarios.core.Empleado.EmpleadoRepository;
import mx.gob.sedif.inventarios.core.HistorialResguardo.HistorialResguardoService;
import mx.gob.sedif.inventarios.exception.MessageConstants;
import mx.gob.sedif.inventarios.exception.ResourceNotFoundException;
import mx.gob.sedif.inventarios.util.PagedResponse;
import mx.gob.sedif.inventarios.util.Paginacion;
import mx.gob.sedif.inventarios.util.enums.EstatusResguardo;
import mx.gob.sedif.inventarios.util.enums.Movimiento;

@Service
@RequiredArgsConstructor
public class ResguardoService {

    private final ResguardoRepository resguardoRepository;
    private final AreaAdscripcionRepository areaRepository;
    private final EmpleadoRepository empleadoRepository;
    private final HistorialResguardoService historialService;
    private final ResguardoMapper resguardoMapper;

    private static final Integer ID_UNIDAD = 151;
    private static final Integer ID_DIRECCION = 152;
    private static final Integer ID_SECCION = 166;
    private static final Integer ID_DEPTO_RECURSOS_MATERIALES = 163;

    /**
     * Tope de ids por petición en /etiquetas y /formato. Los ids viajan en la query string,
     * y por encima de este orden de magnitud la URL revienta el límite de cabecera de Tomcat
     * (8 KB) antes de llegar al controller.
     */
    private static final int MAX_IDS = 500;

    /**
     * Punto único de consulta: sustituye a listarResguardos() + filtrarResguardos(), que
     * eran la misma consulta (una spec sin predicados es un SELECT sin WHERE). Todos los
     * filtros son opcionales y se combinan con AND.
     */
    @Transactional(readOnly = true)
    public PagedResponse<ResguardoRecord> buscarResguardos(ResguardoFiltro filtro, Pageable pageable) {
        Specification<Resguardo> spec = Specification.allOf(
            ResguardoSpec.porBusqueda(filtro.q()),
            ResguardoSpec.porIdArea(filtro.idArea()),
            ResguardoSpec.porFechaAsignacion(filtro.fechaAsignacion()),
            ResguardoSpec.porEstatus(filtro.estatus()),
            ResguardoSpec.porArea(filtro.area()),
            ResguardoSpec.porDescripcion(filtro.descripcion()),
            ResguardoSpec.porEmpleado(filtro.empleado()),
            ResguardoSpec.porNoInventario(filtro.noInventario())
        );

        return PagedResponse.from(
            resguardoRepository.findAll(spec, Paginacion.conOrden(pageable)).map(resguardoMapper::toRecord)
        );
    }

    @Transactional
    public ResguardoRecord crearResguardo(ResguardoRequest request) {
        Resguardo resguardo = new Resguardo();
        mapearCampos(resguardo, request);
        resguardoRepository.save(resguardo);

        historialService.registrarHistorial(resguardo, Movimiento.ALTA, MessageConstants.ALTA_BIEN_HISTORIAL);

        return resguardoMapper.toRecord(resguardo);
    }

    @Transactional
    public ResguardoRecord actualizarResguardo(Integer id, ResguardoRequest request) {
        Resguardo resguardo = resguardoRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(MessageConstants.RESGUARDO_NO_ENCONTRADO.formatted(id)));
        mapearCampos(resguardo, request);
        return resguardoMapper.toRecord(resguardoRepository.save(resguardo));
    }

    @Transactional(readOnly = true)
    public List<EtiquetaRecord> obtenerEtiquetasPorIds(List<Integer> ids) {
        return resguardoRepository.findAllByIdConRelaciones(validarIds(ids)).stream()
            .map(resguardoMapper::toRecord)
            .map(EtiquetaRecord::from)
            .toList();
    }

    @Transactional(readOnly = true)
    public List<FormatoResguardoRecord> generarFormatosResguardo(List<Integer> ids) {
        List<Integer> idsUnicos = validarIds(ids);

        List<ResguardoRecord> seleccionados = resguardoRepository.findAllByIdConRelaciones(idsUnicos)
            .stream()
            .map(resguardoMapper::toRecord)
            .toList();

        if (seleccionados.size() != idsUnicos.size()) {
            throw new ResourceNotFoundException(MessageConstants.RESGUARDOS_NO_EXISTEN);
        }

        // El formato de resguardo es un documento que firma un empleado: un bien sin
        // empleado asignado (DISPONIBLE o BAJA) no puede aparecer en uno.
        List<String> sinEmpleado = seleccionados.stream()
            .filter(r -> r.idEmpleado() == null)
            .map(r -> r.noInventarioBien() != null ? r.noInventarioBien() : "id " + r.id())
            .toList();

        if (!sinEmpleado.isEmpty()) {
            throw new InvalidOperationException(
                MessageConstants.FORMATO_SIN_EMPLEADO.formatted(String.join(", ", sinEmpleado)));
        }

        // áreas fijas: una sola query batch, son iguales para todos los formatos
        Map<Integer, AreaAdscripcion> areasFijas = areaRepository.findAllById(
            List.of(ID_UNIDAD, ID_DIRECCION, ID_SECCION, ID_DEPTO_RECURSOS_MATERIALES))
            .stream().collect(Collectors.toMap(AreaAdscripcion::getId, a -> a));

        String unidad = obtenerAreaObligatoria(areasFijas, ID_UNIDAD).getDescripcionAreaAdscripcion();
        String direccion = obtenerAreaObligatoria(areasFijas, ID_DIRECCION).getDescripcionAreaAdscripcion();
        AreaFirmaRecord seccion = toAreaFirma(obtenerAreaObligatoria(areasFijas, ID_SECCION));
        AreaFirmaRecord departamentoRecursosMateriales = toAreaFirma(obtenerAreaObligatoria(areasFijas, ID_DEPTO_RECURSOS_MATERIALES));

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
            throw new InvalidOperationException(MessageConstants.BIEN_YA_DADO_BAJA);
        }

        resguardo.setEstatusResguardo(EstatusResguardo.BAJA);
        resguardo.setActivo(false);
        Resguardo guardado = resguardoRepository.save(resguardo);

        historialService.registrarHistorial(resguardo, Movimiento.BAJA, motivo);

        return resguardoMapper.toRecord(guardado);
    }

    @Transactional
    public ResguardoRecord marcarDisponible(Integer id, String motivo) {
        Resguardo resguardo = resguardoRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(MessageConstants.RESGUARDO_NO_ENCONTRADO.formatted(id)));

        if (resguardo.getEstatusResguardo() == EstatusResguardo.BAJA) {
            throw new InvalidOperationException(MessageConstants.NO_LIBERAR_BIEN_BAJA);
        }

        AreaAdscripcion areaDisponible = areaRepository.findById(ID_SECCION)
            .orElseThrow(() -> new ResourceNotFoundException(MessageConstants.AREA_NO_ENCONTRADA.formatted(ID_SECCION)));

        resguardo.setEmpleado(null);
        resguardo.setAreaAdscripcion(areaDisponible);
        resguardo.setEstatusResguardo(EstatusResguardo.DISPONIBLE);
        Resguardo guardado = resguardoRepository.save(resguardo);

        historialService.registrarHistorial(resguardo, Movimiento.DISPONIBLE, motivo);

        return resguardoMapper.toRecord(guardado);
    }

    @Transactional
    public ResguardoRecord reasignar(Integer id, Integer idNuevoEmpleado, String motivo) {
        Resguardo resguardo = resguardoRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(MessageConstants.RESGUARDO_NO_ENCONTRADO.formatted(id)));

        if (resguardo.getEstatusResguardo() != EstatusResguardo.ACTIVO) {
            throw new InvalidOperationException(MessageConstants.REASIGNAR_SOLO_ACTIVO);
        }

        Empleado nuevoEmpleado = empleadoRepository.findById(idNuevoEmpleado)
            .orElseThrow(() -> new ResourceNotFoundException(MessageConstants.EMPLEADO_NO_ENCONTRADO.formatted(idNuevoEmpleado)));

        resguardo.setEmpleado(nuevoEmpleado);
        resguardo.setAreaAdscripcion(nuevoEmpleado.getAreaAdscripcion());
        resguardo.setFechaAsignacionBien(LocalDate.now());
        Resguardo guardado = resguardoRepository.save(resguardo);

        historialService.registrarHistorial(resguardo, Movimiento.REASIGNACION, motivo);

        return resguardoMapper.toRecord(guardado);
    }

    @Transactional
    public ReasignarLoteResponse reasignarLote(List<Integer> ids, Integer idNuevoEmpleado, String motivo) {
        Empleado nuevoEmpleado = empleadoRepository.findById(idNuevoEmpleado)
            .orElseThrow(() -> new ResourceNotFoundException(MessageConstants.EMPLEADO_NO_ENCONTRADO.formatted(idNuevoEmpleado)));

        List<Integer> idsUnicos = validarIds(ids);
        List<Integer> exitosos = new ArrayList<>();
        List<ReasignarLoteError> errores = new ArrayList<>();

        for (Integer id : idsUnicos) {
            try {
                Resguardo resguardo = resguardoRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException(MessageConstants.RESGUARDO_NO_ENCONTRADO.formatted(id)));

                if (resguardo.getEstatusResguardo() != EstatusResguardo.ACTIVO) {
                    throw new InvalidOperationException(MessageConstants.REASIGNAR_SOLO_ACTIVO);
                }

                resguardo.setEmpleado(nuevoEmpleado);
                resguardo.setAreaAdscripcion(nuevoEmpleado.getAreaAdscripcion());
                resguardo.setFechaAsignacionBien(LocalDate.now());
                resguardoRepository.save(resguardo);

                historialService.registrarHistorial(resguardo, Movimiento.REASIGNACION, motivo);
                exitosos.add(id);
            } catch (ResourceNotFoundException | InvalidOperationException e) {
                errores.add(new ReasignarLoteError(id, e.getMessage()));
            }
        }

        return new ReasignarLoteResponse(exitosos, errores);
    }

    @Transactional
    public ResguardoRecord asignar(Integer id, Integer idEmpleado, Integer idAreaAdscripcion, String motivo) {
        Resguardo resguardo = resguardoRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(MessageConstants.RESGUARDO_NO_ENCONTRADO.formatted(id)));

        if (resguardo.getEstatusResguardo() != EstatusResguardo.DISPONIBLE) {
            throw new InvalidOperationException(MessageConstants.ASIGNAR_SOLO_DISPONIBLE);
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

        return resguardoMapper.toRecord(guardado);
    }

    //METODOS PRIVADOS

    private List<Integer> validarIds(List<Integer> ids) {
        if (ids == null || ids.isEmpty()) {
            throw new InvalidOperationException(MessageConstants.SELECCIONAR_AL_MENOS_UN_BIEN);
        }

        List<Integer> idsUnicos = ids.stream()
            .filter(java.util.Objects::nonNull)
            .distinct()
            .toList();

        if (idsUnicos.isEmpty()) {
            throw new InvalidOperationException(MessageConstants.SELECCIONAR_AL_MENOS_UN_BIEN);
        }

        if (idsUnicos.size() > MAX_IDS) {
            throw new InvalidOperationException(
                MessageConstants.MAX_IDS_EXCEDIDO.formatted(MAX_IDS, idsUnicos.size()));
        }

        return idsUnicos;
    }

    private void mapearCampos(Resguardo resguardo, ResguardoRequest request) {
        if (request.idAreaAdscripcion() == null) {
            throw new InvalidOperationException(MessageConstants.AREA_OBLIGATORIA);
        }
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

    private AreaAdscripcion obtenerAreaObligatoria(Map<Integer, AreaAdscripcion> areas, Integer id) {
        AreaAdscripcion area = areas.get(id);
        if (area == null) {
            throw new ResourceNotFoundException(MessageConstants.AREA_NO_ENCONTRADA.formatted(id));
        }
        return area;
    }

    private AreaFirmaRecord toAreaFirma(AreaAdscripcion area) {
        return new AreaFirmaRecord(area.getDescripcionAreaAdscripcion(), area.getResponsable());
    }
}
