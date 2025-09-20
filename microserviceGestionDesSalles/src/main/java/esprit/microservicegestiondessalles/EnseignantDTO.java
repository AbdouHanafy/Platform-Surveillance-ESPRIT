
package esprit.microservicegestiondessalles;

import lombok.Data;

@Data
public class EnseignantDTO {
    private Long id;
    private String nom;
    private String prenom;
    private String email;
    private String telephone;
    private Long userId;
    private String matricule;


    private String role;

    private ModuleDTO module;
}
