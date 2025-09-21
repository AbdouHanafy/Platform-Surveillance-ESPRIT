package esprit.demo_user_stage.Repository;

import esprit.demo_user_stage.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    User findByUsername(String username);
    Optional<User> findByEmail(String email);


    User findByMatricule(String matricule);
    List<User> findByRole(String role);

}
