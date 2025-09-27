package esprit.microservicegestiondessalles.Entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "module")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Module {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String codeModule;
    private String libelleModule;
    
    @ManyToOne
    @JoinColumn(name = "unite_pedagogique_id")
    private UnitePedagogique unitePedagogique;
    
    // Constructors, getters, and setters are handled by Lombok
}

