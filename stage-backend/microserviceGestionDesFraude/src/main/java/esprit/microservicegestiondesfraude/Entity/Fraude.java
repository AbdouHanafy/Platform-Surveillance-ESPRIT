package esprit.microservicegestiondesfraude.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Fraude {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Étudiant
    private String nomEtudiant;
    private String matriculeEtudiant;

    // Groupe
    private Long groupeId;
    private String nomGroupe;

    // Enseignant
    private Long enseignantId;
    private String nomEnseignant;
    private String matriculeEnseignant;

    // Détails de la fraude
    private String type;
    private String description;
    private LocalDateTime dateDeclaration;

    @Enumerated(EnumType.STRING)
    private StatutFraude statut;

    private String rapport;
}
