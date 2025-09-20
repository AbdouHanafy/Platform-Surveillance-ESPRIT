package esprit.microservice1.Entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "groupe")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Groupe {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nomClasse;
    private String niveau;
    private String optionGroupe;
    private int effectif;
    private String departement;


}
