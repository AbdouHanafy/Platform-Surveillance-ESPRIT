package esprit.microservicegestiondesfraude.Entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FraudeTableDTO {

    private String nomEtudiant;
    private String groupeName;
    private String nomEnseignant;
    private LocalDateTime dateDeclaration;
    private String description;
    private String statut;
}
