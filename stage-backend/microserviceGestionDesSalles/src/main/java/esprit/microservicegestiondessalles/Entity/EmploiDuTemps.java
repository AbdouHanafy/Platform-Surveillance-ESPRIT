
package esprit.microservicegestiondessalles.Entity;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "emploi_Enseignant")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmploiDuTemps {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long enseignantId;

    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate date;
    @DateTimeFormat(pattern = "HH:mm")
    private LocalTime heureDebut;
    @DateTimeFormat(pattern = "HH:mm")
    private LocalTime heureFin;
    private String typeActivite; // cours, soutenance, surveillance, etc.

    @Column(name = "salle")
    private String salle;

    @Column(name = "groupe_id")
    private Long groupeId;

}
