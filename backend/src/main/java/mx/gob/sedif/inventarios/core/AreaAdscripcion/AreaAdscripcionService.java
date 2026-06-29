package mx.gob.sedif.inventarios.core.AreaAdscripcion;

import java.util.List;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import mx.gob.sedif.inventarios.exception.MessageConstants;

@Service
@RequiredArgsConstructor
public class AreaAdscripcionService {

    private final AreaAdscripcionRepository areaAdscripcionRepository;

    @Transactional(readOnly = true)
    public List<AreaAdscripcionRecord> listarAreasActivas() {
        return areaAdscripcionRepository.findAllActivas().stream()
            .map(a -> new AreaAdscripcionRecord(a.getId(), a.getCodigoAreaAdscripcion(), a.getDescripcionAreaAdscripcion(), a.getAreaActiva()))
            .toList();
    }

    @Transactional(readOnly = true)
    public List<AreaAdscripcionRecord> listarTodas() {
        return areaAdscripcionRepository.findAll().stream()
            .map(a -> new AreaAdscripcionRecord(a.getId(), a.getCodigoAreaAdscripcion(), a.getDescripcionAreaAdscripcion(), a.getAreaActiva()))
            .toList();
    }

    @Transactional
    public AreaAdscripcionRecord crearArea(AreaAdscripcionRequest request) {
        AreaAdscripcion area = new AreaAdscripcion();
        mapearCampos(area, request);
        return toRecord(areaAdscripcionRepository.save(area));
    }

    @Transactional
    public AreaAdscripcionRecord actualizarArea(Integer id, AreaAdscripcionRequest request) {
        AreaAdscripcion area = areaAdscripcionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException(MessageConstants.AREA_NO_ENCONTRADA.formatted(id)));
        mapearCampos(area, request);
        return toRecord(areaAdscripcionRepository.save(area));
    }

    @Transactional(readOnly = true)
    public List<AreaAdscripcionRecord> filtrarAreas(String codigo, String descripcion) {
        Specification<AreaAdscripcion> spec = Specification
            .where(AreaAdscripcionSpec.porCodigo(codigo))
            .and(AreaAdscripcionSpec.porDescripcion(descripcion));

        return areaAdscripcionRepository.findAll(spec).stream()
            .map(this::toRecord)
            .toList();
    }

    //METODOS PRIVADOS-------------
    
    private void mapearCampos(AreaAdscripcion area, AreaAdscripcionRequest request) {
        area.setCodigoAreaAdscripcion(request.codigoAreaAdscripcion());
        area.setDescripcionAreaAdscripcion(request.descripcionAreaAdscripcion());
        area.setAreaActiva(request.areaActiva() != null ? request.areaActiva() : true);
    }

    private AreaAdscripcionRecord toRecord(AreaAdscripcion a) {
        return new AreaAdscripcionRecord(a.getId(), a.getCodigoAreaAdscripcion(), a.getDescripcionAreaAdscripcion(), a.getAreaActiva());
    }
}
