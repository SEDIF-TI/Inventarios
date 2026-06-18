package com.inventarios.back.repository;

import com.inventarios.back.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {
    List<Producto> findBySCategoria(String sCategoria);
    List<Producto> findBySNombreContainingIgnoreCase(String sNombre);
}
