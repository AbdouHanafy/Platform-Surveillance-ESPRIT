package esprit.microservice1.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "emploi_du_temps")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmploiDuSurveillance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    private Long salleId;
    private String matiere;
    private LocalDate date;
    private LocalTime heureDebut;
    private LocalTime heureFin;
    private String typeEpreuve; // ex : cours, TD, TP
    private int semestre;
    private int coef;
    private int charge;
    @Column(name = "reservation_id")
    private Long reservationId;

    // Nouveaux champs pour l'affectation automatique
    private Long enseignantId;
    private Long groupeId; 
    private Long moduleId;
    private String typeActivite; // Type d'activité/examen
    private String statut; // "AFFECTE_AUTO", "AFFECTE_MANUEL", etc.

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "enseignantId", referencedColumnName = "id", insertable = false, updatable = false)
    private Enseignant enseignant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "groupeId", referencedColumnName = "id", insertable = false, updatable = false)
    private Groupe groupe;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "moduleId", referencedColumnName = "id", insertable = false, updatable = false)
    private MyModule myModule;




}
