package esprit.microservice1.Entity;


import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "heures_manquantes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HeuresManquantes {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long enseignantId;
    private int semestre;
    private int annee;
    private float heuresManquantes;

}
