package esprit.microservice1.Repository;


import esprit.microservice1.Entity.ExamenChrono;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ExamenChronoRepository extends JpaRepository<ExamenChrono,Long> {
    List<ExamenChrono> findByDateExamenAndSeance(LocalDate dateExamen, String seance);


    // 🔹 Nouvelle méthode pour compter le nombre d'examens d'un enseignant
    @Query("SELECT e FROM ExamenChrono e JOIN e.enseignants ens WHERE ens.id = :enseignantId")
    List<ExamenChrono> findByEnseignantId(@Param("enseignantId") Long enseignantId);
}