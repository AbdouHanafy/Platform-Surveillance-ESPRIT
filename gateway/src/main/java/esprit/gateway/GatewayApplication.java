package esprit.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
@EnableDiscoveryClient
public class GatewayApplication {

	public static void main(String[] args) {
		SpringApplication.run(GatewayApplication.class, args);
	}

	@Bean
	public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
		return builder.routes()
				.route("microservice1",
						r->r.path("/emploisdutemps/**")
								.uri("lb://microservice1"))
				.route("microservice1",
						r->r.path("/ensignat/**")
								.uri("lb://microservice1"))

				.route("user-service",
						r->r.path("/auth/**")
								.uri("lb://user-service"))



				.route("microserviceGestionDesSalles",
						r->r.path("/salles/**" , "/reservations/**")
								.uri("lb://microserviceGestionDesSalles"))

				.build();



	}
}
