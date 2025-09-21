package esprit.microservice1.Entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "ExamenBesoins")
public class ExamenBesoins {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String periode;

    private String moduleLibelle;

    private int nombreGroupes;
    private int nombreClasses;
    private int nombreSalles;
    private int nombreEnseignants;

    private LocalDateTime dateAjout;

    // getters/setters
}
