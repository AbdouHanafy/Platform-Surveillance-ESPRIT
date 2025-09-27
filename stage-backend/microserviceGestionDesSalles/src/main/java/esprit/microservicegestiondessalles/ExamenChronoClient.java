package esprit.microservicegestiondessalles;

import esprit.microservicegestiondessalles.Entity.SalleReservationDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@FeignClient(name = "microservice1", url = "http://localhost:8090")
public interface ExamenChronoClient {
    
    @GetMapping("/examen-chrono/salle/{salleId}/reservations")
    List<SalleReservationDTO> getReservationsBySalleId(@PathVariable Long salleId);
}
