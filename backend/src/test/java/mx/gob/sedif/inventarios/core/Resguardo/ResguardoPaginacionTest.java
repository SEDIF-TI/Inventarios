package mx.gob.sedif.inventarios.core.Resguardo;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;

import org.hibernate.SessionFactory;
import org.hibernate.stat.Statistics;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.test.context.TestPropertySource;

import jakarta.persistence.EntityManager;
import mx.gob.sedif.inventarios.core.AreaAdscripcion.AreaAdscripcion;
import mx.gob.sedif.inventarios.core.Empleado.Empleado;
import mx.gob.sedif.inventarios.util.Paginacion;
import mx.gob.sedif.inventarios.util.enums.EstatusResguardo;

/**
 * Verifica sobre una base real (H2 en modo PostgreSQL) las tres propiedades de las que
 * depende la paginación y que no se pueden dar por supuestas leyendo el código:
 *
 *  1. que el @EntityGraph elimina el N+1 de verdad (se mide contando sentencias JDBC),
 *  2. que Hibernate pagina en SQL y no en memoria,
 *  3. que el orden es total, y por tanto las páginas no se solapan ni pierden filas.
 */
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:inventarios;MODE=PostgreSQL;DB_CLOSE_DELAY=-1;INIT=CREATE SCHEMA IF NOT EXISTS sc_inventario",
    "spring.datasource.driver-class-name=org.h2.Driver",
    "spring.datasource.username=sa",
    "spring.datasource.password=",
    "spring.jpa.hibernate.ddl-auto=create-drop",
    "spring.jpa.properties.hibernate.default_schema=sc_inventario",
    "spring.jpa.properties.hibernate.generate_statistics=true",
    "spring.flyway.enabled=false",
    "JWT_SECRET=solo-para-tests"
})
class ResguardoPaginacionTest {

    private static final int TOTAL_BIENES = 30;

    @Autowired private ResguardoRepository resguardoRepository;
    @Autowired private EntityManager em;

    private Statistics stats;

    @BeforeEach
    void sembrarDatos() {
        // Cada bien con área y empleado DISTINTOS: es el peor caso para el N+1, porque el
        // contexto de persistencia no puede deduplicar nada.
        for (int i = 0; i < TOTAL_BIENES; i++) {
            AreaAdscripcion area = new AreaAdscripcion();
            area.setCodigoAreaAdscripcion("A" + i);
            area.setDescripcionAreaAdscripcion("AREA " + i);
            area.setAreaActiva(true);
            em.persist(area);

            Empleado empleado = new Empleado();
            empleado.setNombreEmpleado("NOMBRE" + i);
            empleado.setApellidoPaternoEmpleado("PATERNO" + i);
            empleado.setApellidoMaternoEmpleado("MATERNO" + i);
            empleado.setNoControlEmpleado("NC" + i);
            empleado.setEmpleadoActivo(true);
            em.persist(empleado);

            Resguardo r = new Resguardo();
            r.setAreaAdscripcion(area);
            r.setEmpleado(empleado);
            r.setNoInventarioBien("INV-" + i);
            r.setDescripcionBien("LAPTOP " + i);
            r.setEstatusResguardo(EstatusResguardo.ACTIVO);
            r.setActivo(true);
            em.persist(r);
        }

        em.flush();
        // Sin el clear, las entidades quedarían en el contexto de persistencia y las lecturas
        // LAZY se servirían de la caché de primer nivel: el N+1 quedaría oculto y el test
        // pasaría aunque el @EntityGraph no funcionara.
        em.clear();

        stats = em.getEntityManagerFactory().unwrap(SessionFactory.class).getStatistics();
        stats.clear();
    }

    @Test
    @DisplayName("una página se sirve con 2 consultas (contenido + count), sin N+1 pese a que area y empleado son LAZY")
    void sinNMasUno() {
        Page<Resguardo> pagina = resguardoRepository.findAll(
            Specification.allOf(), Paginacion.conOrden(PageRequest.of(0, 10)));

        // Tocar las relaciones LAZY: si no vinieran en el grafo, cada acceso dispararía un SELECT.
        pagina.getContent().forEach(r -> {
            r.getAreaAdscripcion().getDescripcionAreaAdscripcion();
            r.getEmpleado().getNombreEmpleado();
        });

        long consultas = stats.getPrepareStatementCount();

        assertThat(pagina.getContent()).hasSize(10);
        assertThat(pagina.getTotalElements()).isEqualTo(TOTAL_BIENES);
        // Sin @EntityGraph serían 2 + 10 areas + 10 empleados = 22.
        assertThat(consultas)
            .as("consultas JDBC para una página de 10 con 10 áreas y 10 empleados distintos")
            .isEqualTo(2);
    }

    @Test
    @DisplayName("Hibernate pagina en SQL: solo trae las filas de la página, no la tabla entera")
    void paginaEnSqlNoEnMemoria() {
        resguardoRepository.findAll(Specification.allOf(), Paginacion.conOrden(PageRequest.of(0, 10)));

        // Se cuenta solo la entidad raíz: el total de entidades cargadas incluiría también las
        // 10 áreas y los 10 empleados que trae el grafo, que es justo lo que se busca.
        // Si Hibernate paginara en memoria (lo que ocurriría al hacer fetch de una colección)
        // materializaría los 30 resguardos y recortaría después.
        long resguardosCargados = stats.getEntityStatistics(Resguardo.class.getName()).getLoadCount();

        assertThat(resguardosCargados)
            .as("entidades Resguardo materializadas para una página de 10 sobre %d filas", TOTAL_BIENES)
            .isEqualTo(10);
    }

    @Test
    @DisplayName("el orden es total: recorrer las páginas devuelve cada fila exactamente una vez")
    void paginasSinSolapeNiPerdidas() {
        // Se ordena por un campo con valores repetidos a propósito: sin desempate por id el
        // motor podría devolver las filas empatadas en distinto orden en cada consulta.
        Sort ordenAmbiguo = Sort.by(Sort.Order.asc("estatusResguardo"));

        List<Integer> vistos = new java.util.ArrayList<>();
        for (int pagina = 0; pagina < 3; pagina++) {
            resguardoRepository.findAll(
                    Specification.allOf(),
                    Paginacion.conOrden(PageRequest.of(pagina, 10, ordenAmbiguo)))
                .forEach(r -> vistos.add(r.getId()));
        }

        assertThat(vistos).hasSize(TOTAL_BIENES);
        assertThat(vistos).doesNotHaveDuplicates();
    }

    @Test
    @DisplayName("la búsqueda q hace OR sobre inventario, descripción, área y empleado")
    void busquedaOr() {
        assertThat(buscar("INV-7").getTotalElements()).isEqualTo(1);
        assertThat(buscar("LAPTOP 7").getTotalElements()).isEqualTo(1);
        assertThat(buscar("AREA 7").getTotalElements()).isEqualTo(1);
        assertThat(buscar("PATERNO7").getTotalElements()).isEqualTo(1);
        // Coincide con los 30 "LAPTOP n" por descripción: confirma que el filtro no es un AND.
        assertThat(buscar("laptop").getTotalElements()).isEqualTo(TOTAL_BIENES);
        assertThat(buscar("no-existe").getTotalElements()).isZero();
    }

    private Page<Resguardo> buscar(String q) {
        return resguardoRepository.findAll(
            Specification.allOf(ResguardoSpec.porBusqueda(q)),
            Paginacion.conOrden(PageRequest.of(0, 10)));
    }
}
