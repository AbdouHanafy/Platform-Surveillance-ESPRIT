package esprit.microservice1.Repository;

import esprit.microservice1.Entity.Groupe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface GroupeRepository extends JpaRepository<Groupe, Long> {
    boolean existsByNomClasse(String nomClasse);



}
