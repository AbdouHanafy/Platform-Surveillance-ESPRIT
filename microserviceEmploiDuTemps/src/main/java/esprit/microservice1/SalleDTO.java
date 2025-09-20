package esprit.microservice1;

import lombok.Data;

@Data
public class SalleDTO {

    private Long id;
    private String nom;
    private int capacite;
    private String bloc;
    private int etage;
    private boolean estReservee = false;


}

