package esprit.microservicegestiondessalles;


import lombok.Data;

@Data
public class UserDTO {

    private  Long id;
    private String matricule;
    private String token;
    private String role;
    private String username;
    private String email;





}