package esprit.microservicegestiondessalles.Entity;


import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "historique_reservation")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HistoriqueReservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime dateModification;
    private String typeAction; // ex: création, modification, annulation
    private Long utilisateurId;
    private String commentaire;

    @ManyToOne
    @JoinColumn(name = "reservation_id")
    private ReservationSalle reservation;
}
