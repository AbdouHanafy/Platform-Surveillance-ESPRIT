package esprit.microservice1;


import esprit.microservice1.configuration.FeignClientConfig;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@FeignClient(name = "microserviceGestionDesSalles",contextId = "salleClient1", url = "http://localhost:8093")
public interface SalleClient {

    @GetMapping("/salles/{id}")
    SalleDTO getById(@PathVariable("id") Long id);

    @GetMapping("/salles")
    List<SalleDTO> getAllSalles();

    @GetMapping("/salles/{id}/disponibilite")
    boolean verifierDisponibilite(@PathVariable("id") Long salleId,
                                  @RequestParam("date") LocalDate date,
                                  @RequestParam("heureDebut") LocalTime heureDebut,
                                  @RequestParam("heureFin") LocalTime heureFin);



    @GetMapping("/salles/disponibles")
    List<Long> getAvailableSalleIds();
}
