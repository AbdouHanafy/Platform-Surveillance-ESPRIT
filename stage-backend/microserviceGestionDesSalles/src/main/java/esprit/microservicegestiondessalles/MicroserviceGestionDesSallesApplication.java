package esprit.microservicegestiondessalles;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients(basePackages = "esprit.microservicegestiondessalles")
@EnableDiscoveryClient
public class MicroserviceGestionDesSallesApplication {

	public static void main(String[] args) {
		SpringApplication.run(MicroserviceGestionDesSallesApplication.class, args);
	}

}
