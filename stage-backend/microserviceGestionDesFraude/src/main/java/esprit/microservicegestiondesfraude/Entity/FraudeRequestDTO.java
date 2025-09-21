package esprit.microservicegestiondesfraude.Entity;

import lombok.Data;

@Data
public class FraudeRequestDTO {

    private String nomEtudiant;
    private String matricule; // étudiant
    private String nomEnseignant;
    private String matriculeEnseignant;
    private Long groupeId;
    private String nomGroupe;
    private String type;
    private String description;
}
