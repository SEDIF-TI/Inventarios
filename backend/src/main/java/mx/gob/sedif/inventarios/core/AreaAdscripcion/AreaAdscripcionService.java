package mx.gob.sedif.inventarios.core.AreaAdscripcion;

import java.util.List;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import mx.gob.sedif.inventarios.exception.MessageConstants;
import mx.gob.sedif.inventarios.exception.ResourceNotFoundException;
import mx.gob.sedif.inventarios.util.PagedResponse;
import mx.gob.sedif.inventarios.util.Paginacion;

@Service
@RequiredArgsConstructor
public class AreaAdscripcionService {

    private final AreaAdscripcionRepository areaAdscripcionRepository;
    private final AreaAdscripcionMapper areaAdscripcionMapper;

    @Transactional(readOnly = true)
    @Cacheable("areasActivas")
    public List<AreaAdscripcionRecord> listarAreasActivas() {
        return areaAdscripcionRepository.findAllActivas().stream()
            .map(areaAdscripcionMapper::toRecord)
        .toList();
    }

    @Transactional(readOnly = true)
    public PagedResponse<AreaAdscripcionRecord> buscarAreas(
        String q, String codigo, String descripcion, Boolean activa, Pageable pageable
    ) {
        Specification<AreaAdscripcion> spec = Specification.allOf(
            AreaAdscripcionSpec.porBusqueda(q),
            AreaAdscripcionSpec.porActiva(activa),
            AreaAdscripcionSpec.porCodigo(codigo),
            AreaAdscripcionSpec.porDescripcion(descripcion)
        );

        return PagedResponse.from(
            areaAdscripcionRepository.findAll(spec, Paginacion.conOrden(pageable)).map(areaAdscripcionMapper::toRecord)
        );
    }

    @Transactional
    @CacheEvict(value = "areasActivas", allEntries = true)
    public AreaAdscripcionRecord crearArea(AreaAdscripcionRequest request) {
        AreaAdscripcion area = new AreaAdscripcion();
        mapearCampos(area, request);
        return areaAdscripcionMapper.toRecord(areaAdscripcionRepository.save(area));
    }

    @Transactional
    @CacheEvict(value = "areasActivas", allEntries = true)
    public AreaAdscripcionRecord actualizarArea(Integer id, AreaAdscripcionRequest request) {
        AreaAdscripcion area = areaAdscripcionRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(MessageConstants.AREA_NO_ENCONTRADA.formatted(id)));
        mapearCampos(area, request);
        return areaAdscripcionMapper.toRecord(areaAdscripcionRepository.save(area));
    }

    //METODOS PRIVADOS-------------
    
    private void mapearCampos(AreaAdscripcion area, AreaAdscripcionRequest request) {
        area.setCodigoAreaAdscripcion(request.codigoAreaAdscripcion());
        area.setDescripcionAreaAdscripcion(request.descripcionAreaAdscripcion());
        area.setResponsable(request.responsable());
        area.setAreaActiva(request.areaActiva() != null ? request.areaActiva() : true);
    }

}
