package esprit.microservice1.Entity;


import lombok.Data;

@Data
public class EnseignantDTO {
    private Long id;
    private String nom;
    private String prenom;
    private String email;
    private String telephone;
    private String matricule;
    private String role;
    private GradeEns grade;
    private String unitePedagogiqueLibelle;



}