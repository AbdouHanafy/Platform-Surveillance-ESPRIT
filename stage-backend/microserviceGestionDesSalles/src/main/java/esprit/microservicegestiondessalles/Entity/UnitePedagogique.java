package esprit.microservicegestiondessalles.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "unite_pedagogique")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UnitePedagogique {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String libelle;
    
    @OneToMany(mappedBy = "unitePedagogique", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Module> modules;
    
    // Constructors, getters, and setters are handled by Lombok
}

