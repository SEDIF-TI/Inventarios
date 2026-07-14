package mx.gob.sedif.inventarios;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@EnableCaching
public class InventariosApplication {

	public static void main(String[] args) {
		SpringApplication.run(InventariosApplication.class, args);
	}

}
