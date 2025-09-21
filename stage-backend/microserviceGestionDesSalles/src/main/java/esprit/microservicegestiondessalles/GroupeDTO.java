package esprit.microservicegestiondessalles;

import lombok.Data;

@Data
public class GroupeDTO {
    private Long id;
    private String nomClasse;
    private String niveau;
    private String optionGroupe;
    private int effectif;
    private String departement;


}