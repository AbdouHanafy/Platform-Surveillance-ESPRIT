package esprit.microservice1;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class SessionDTO {
    private Long id;
    private String nom_session;
    private String periode; // PERIODE_1, PERIODE_2, PERIODE_3, PERIODE_4
    private String typeSession; // NORMALE, RATTRAPAGE
    private LocalDate dateDebut;
    private LocalDate dateFin;
    private List<Long> moduleIds;
}