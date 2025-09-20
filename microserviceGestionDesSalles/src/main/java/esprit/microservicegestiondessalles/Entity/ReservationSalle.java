package esprit.microservicegestiondessalles.Entity;


import jakarta.persistence.*;
import lombok.*;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "reservations_salle")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReservationSalle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
@DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate dateExamen;

@DateTimeFormat(pattern = "HH:mm")
    private LocalTime heureDebut;

@DateTimeFormat(pattern = "HH:mm")
    private LocalTime heureFin;

    private Long enseignantId;

    // Nouveaux champs pour l'affectation automatique
    private String statut; // "Occupé" ou "Libre"
    private String typeReservation; // "AFFECTATION_AUTO" ou "MANUEL"
    private String periode; // "PERIODE_1", "PERIODE_2", etc.
    private String typeExamen; // "SURVEILLANCE", "CORRECTION", etc.
    private Long moduleId; // ID du module associé
    private Long groupeId; // ID du groupe associé

    @ManyToOne
    @JoinColumn(name = "salle_id")
    private Salle salle;
}
