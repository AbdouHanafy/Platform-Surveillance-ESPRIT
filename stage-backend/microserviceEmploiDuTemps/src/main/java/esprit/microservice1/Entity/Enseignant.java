package esprit.microservice1.Entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity
@Table(name = "enseignant")
public class Enseignant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nom;
    private String prenom;
    private String email;
    private String telephone;

    private Long userId;      // Id venant du microservice User
    private String matricule;
    private String role;      // tu peux stocker aussi le rôle localement

    @Enumerated(EnumType.STRING)
    private GradeEns grade;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "unite_pedagogique_id")

    private UnitePedagogique unitePedagogique;

    @ManyToMany
    @JoinTable(
            name = "enseignant_module",
            joinColumns = @JoinColumn(name = "enseignant_id"),
            inverseJoinColumns = @JoinColumn(name = "module_id")
    )

    private List<MyModule> modules;


}
