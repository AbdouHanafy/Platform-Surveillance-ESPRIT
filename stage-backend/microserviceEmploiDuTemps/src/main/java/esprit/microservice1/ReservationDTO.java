package esprit.microservice1;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class ReservationDTO {
    private Long id;
    private LocalDate dateExamen;
    private LocalTime heureDebut;
    private LocalTime heureFin;
    private Long enseignantId;
    private String unitePedagogique;
    private String etat;
    private Long salleId;
}

