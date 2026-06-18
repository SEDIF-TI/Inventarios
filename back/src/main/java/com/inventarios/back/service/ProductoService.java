package com.inventarios.back.service;

import com.inventarios.back.model.Producto;
import com.inventarios.back.repository.ProductoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProductoService {

    private final ProductoRepository productoRepository;

    public List<Producto> findAll() { return productoRepository.findAll(); }
    public Optional<Producto> findById(Long id) { return productoRepository.findById(id); }
    public Producto save(Producto p) { return productoRepository.save(p); }
    public void deleteById(Long id) { productoRepository.deleteById(id); }
    public List<Producto> buscarPorNombre(String nombre) {
        return productoRepository.findBySNombreContainingIgnoreCase(nombre);
    }
}
