package mx.gob.sedif.inventarios.core.AreaAdscripcion;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AreaAdscripcionService {

    private final AreaAdscripcionRepository areaAdscripcionRepository;

    @Transactional(readOnly = true)
    public List<AreaAdscripcionRecord> listarAreas() {
        return areaAdscripcionRepository.findAllActivas().stream()
            .map(a -> new AreaAdscripcionRecord(a.getId(), a.getCodigoAreaAdscripcion(), a.getDescripcionAreaAdscripcion()))
            .toList();
    }
}
