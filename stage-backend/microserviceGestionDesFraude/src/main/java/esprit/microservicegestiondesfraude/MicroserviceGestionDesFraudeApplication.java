package esprit.microservicegestiondesfraude;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients(basePackages = "esprit.microservicegestiondesfraude")
@EnableDiscoveryClient
public class MicroserviceGestionDesFraudeApplication {

	public static void main(String[] args) {
		SpringApplication.run(MicroserviceGestionDesFraudeApplication.class, args);
	}

}
