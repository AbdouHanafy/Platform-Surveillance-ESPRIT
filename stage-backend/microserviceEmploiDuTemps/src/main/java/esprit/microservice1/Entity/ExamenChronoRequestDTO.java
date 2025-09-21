package esprit.microservice1.Entity;

import lombok.*;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamenChronoRequestDTO {
    private Long sessionId;
    private Periode periode;
    private Long moduleId;
    private Long groupeId;
    private LocalDate dateExamen;
    private String seance;
}
