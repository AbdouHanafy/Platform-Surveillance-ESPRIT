package esprit.microservice1.Repository;

import esprit.microservice1.Entity.HeuresManquantes;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;


@Repository
public interface HeuresManquantesRepository extends JpaRepository<HeuresManquantes, Long> {
    List<HeuresManquantes> findByEnseignantId(Long enseignantId);
    void deleteByEnseignantId(Long enseignantId);

    Optional<HeuresManquantes> findByEnseignantIdAndSemestreAndAnnee(Long enseignantId, int semestre, int annee);

}
