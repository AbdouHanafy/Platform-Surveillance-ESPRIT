package esprit.microservice1;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SalleReservationDTO {
    private Long examenId;
    private String moduleLibelle;
    private String groupeNom;
    private LocalDate dateExamen;
    private String seance;
    private String enseignantNom;
    private String enseignantPrenom;
    private String statut; // "RÉSERVÉ", "DISPONIBLE"
}
