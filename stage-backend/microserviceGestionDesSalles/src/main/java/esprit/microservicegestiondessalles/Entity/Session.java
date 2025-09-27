package esprit.microservicegestiondessalles.Entity;


import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.List;


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
    
    private LocalDate dateDebut;
    
    private LocalDate dateFin;

    @Enumerated(EnumType.STRING)
    private Periode periode; // PERIODE_1, PERIODE_2, PERIODE_3, PERIODE_4

    @Enumerated(EnumType.STRING)
    private TypeSession typeSession; // NORMALE, RATTRAPAGE

    @ElementCollection
    @CollectionTable(name = "session_module_ids", joinColumns = @JoinColumn(name = "session_id"))
    @Column(name = "module_id")
    private List<Long> moduleIds;

}
