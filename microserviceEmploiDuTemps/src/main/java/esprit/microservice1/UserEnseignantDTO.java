package esprit.microservice1;

import esprit.microservice1.Entity.Enseignant;

public class UserEnseignantDTO {
    private UserDTO user;
    private Enseignant enseignant;

    public UserDTO getUser() {
        return user;
    }

    public void setUser(UserDTO user) {
        this.user = user;
    }

    public Enseignant getEnseignant() {
        return enseignant;
    }

    public void setEnseignant(Enseignant enseignant) {
        this.enseignant = enseignant;
    }
}
