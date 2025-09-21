package esprit.microservicegestiondesfraude;

import lombok.Data;

@Data
public class EnseignantDTO {
    private Long id;
    private String nom;
    private String matricule;
    private String role;
}
