package esprit.microservicegestiondesfraude.Repository;


import esprit.microservicegestiondesfraude.Entity.Fraude;
import esprit.microservicegestiondesfraude.Entity.StatutFraude;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FraudeRepository  extends JpaRepository<Fraude, Long> {

    // Pour récupérer les fraudes d'un étudiant
    List<Fraude> findByMatriculeEtudiant(String matriculeEtudiant);



    List<Fraude> findByStatut(StatutFraude statut);
}
