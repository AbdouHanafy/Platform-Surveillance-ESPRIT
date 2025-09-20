package esprit.microservicegestiondesfraude;

import lombok.Data;

@Data
public class FraudeRequestDTO {
    private String nomEtudiant;
    private String matricule; // étudiant matricule
    private Long groupeId;    // selected from microservice1
    private String type;
    private String description;
}
