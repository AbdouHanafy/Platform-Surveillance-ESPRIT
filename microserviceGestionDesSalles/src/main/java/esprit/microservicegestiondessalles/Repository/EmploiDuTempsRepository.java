package esprit.microservicegestiondessalles.Repository;

import esprit.microservicegestiondessalles.Entity.EmploiDuTemps;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;


@Repository
public interface EmploiDuTempsRepository extends JpaRepository<EmploiDuTemps, Long> {

    @Query("SELECT COUNT(e) FROM EmploiDuTemps e WHERE e.enseignantId = :enseignantId AND e.date = :date " +
            "AND ( (e.heureDebut < :heureFin) AND (e.heureFin > :heureDebut) )")
    int countConflits(@Param("enseignantId") Long enseignantId,
                      @Param("date") LocalDate date,
                      @Param("heureDebut") LocalTime heureDebut,
                      @Param("heureFin") LocalTime heureFin);


    List<EmploiDuTemps> findByEnseignantId(Long enseignantId);


    // Méthode pour récupérer les emplois d'un enseignant pour une date donnée
    List<EmploiDuTemps> findByEnseignantIdAndDate(Long enseignantId, LocalDate date);


    List<EmploiDuTemps> findBySalle(String salle);
    List<EmploiDuTemps> findBySalleAndDate(String salle, LocalDate date);



}
