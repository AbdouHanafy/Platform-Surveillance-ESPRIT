package esprit.microservice1;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

@FeignClient(name = "microserviceGestionDesSalles",contextId = "salleClient2", url = "http://localhost:8093") // adapte l’URL
public interface ReservationClient {

    @PostMapping("/reservations/{matricule}")
    ReservationDTO creerReservation(@RequestBody ReservationDTO reservation, @PathVariable String matricule);

    @GetMapping("/reservations/salle/{salleId}")
    List<ReservationDTO> getReservationsBySalle(@PathVariable Long salleId);

    @GetMapping("/reservations/salle/{salleId}/date/{date}")
    List<ReservationDTO> getReservationsBySalleAndDate(@PathVariable Long salleId, @PathVariable String date);




    @PostMapping("/reservations/auto")
    void createReservationDepuisEmploi(@RequestBody ReservationDTO reservation);
}
