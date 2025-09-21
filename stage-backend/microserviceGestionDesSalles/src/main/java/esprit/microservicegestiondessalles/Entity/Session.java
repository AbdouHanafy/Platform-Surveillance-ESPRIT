package esprit.microservicegestiondessalles.Entity;


import jakarta.persistence.*;
import lombok.*;


@Entity
@Table(name = "Session")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class Session {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nom_session;



}
