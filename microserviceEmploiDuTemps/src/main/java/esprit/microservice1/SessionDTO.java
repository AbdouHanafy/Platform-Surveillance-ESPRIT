package esprit.microservice1;


import lombok.Data;

@Data
public class SessionDTO {
    private Long id;
    private String nom_session;
    private String periode;


}