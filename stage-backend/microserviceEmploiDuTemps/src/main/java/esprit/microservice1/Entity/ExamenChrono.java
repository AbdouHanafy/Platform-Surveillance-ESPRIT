package esprit.microservice1.Entity;

import jakarta.persistence.*;
import jakarta.websocket.Session;
import lombok.*;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "examen_chrono")
public class ExamenChrono {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long sessionId;

    @Enumerated(EnumType.STRING)
    private Periode periode;

    @ManyToOne
    private MyModule module; //matiere

    @ManyToOne
    private Groupe groupe; //classe


    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate dateExamen; //date(JOUR EXAMEN)

    private String seance; //chrono


    @ManyToMany
    @JoinTable(
            name = "examen_chrono_enseignants",
            joinColumns = @JoinColumn(name = "examen_chrono_id"),
            inverseJoinColumns = @JoinColumn(name = "enseignant_id")
    )
    private List<Enseignant> enseignants;

    // Liste des IDs des salles (dans l'autre microservice)
    @ElementCollection
    @CollectionTable(name = "examen_chrono_salle_ids", joinColumns = @JoinColumn(name = "examen_chrono_id"))
    @Column(name = "salle_id")
    private List<Long> salleIds;
}
