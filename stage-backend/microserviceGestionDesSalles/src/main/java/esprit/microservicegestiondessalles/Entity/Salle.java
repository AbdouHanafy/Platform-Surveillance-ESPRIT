package esprit.microservicegestiondessalles.Entity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "salles",
        uniqueConstraints = @UniqueConstraint(columnNames = {"nom", "bloc", "etage"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class Salle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    private String nom;
    private int capacite;
    private String bloc;
    private int etage;
    @Column(name = "est_reservee")
    private boolean estReservee = false;
}
