package esprit.microservice1.Repository;


import esprit.microservice1.Entity.EmploiDuSurveillance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface EmploiDuTempsRepository extends JpaRepository<EmploiDuSurveillance, Long> {



    List<EmploiDuSurveillance> findByEnseignantIdAndDateBetween(Long enseignantId, LocalDate debut, LocalDate fin);
    List<EmploiDuSurveillance> findByEnseignantId(Long enseignantId);
    List<EmploiDuSurveillance> findBySalleId(Long salleId);

    @Query("""
    SELECT COUNT(DISTINCT e.enseignant.id)
    FROM EmploiDuSurveillance e
    WHERE e.salleId = :salleId
      AND e.date = :date
      AND e.heureDebut < :heureFin
      AND e.heureFin > :heureDebut
""")
    int countEnseignantsAffectesSallePeriode(@Param("salleId") Long salleId,
                                             @Param("date") LocalDate date,
                                             @Param("heureDebut") LocalTime heureDebut,
                                             @Param("heureFin") LocalTime heureFin);

    // Nouvelles méthodes pour l'affectation automatique
    List<EmploiDuSurveillance> findByEnseignantIdAndDate(Long enseignantId, LocalDate date);
    
    @Query("SELECT COUNT(e) FROM EmploiDuSurveillance e WHERE e.enseignantId = :enseignantId AND e.date = :date")
    int countByEnseignantIdAndDate(@Param("enseignantId") Long enseignantId, @Param("date") LocalDate date);
    
    @Query("SELECT COUNT(e) FROM EmploiDuSurveillance e WHERE e.date = :date")
    long countByDate(@Param("date") LocalDate date);
    
    @Query("SELECT COUNT(e) FROM EmploiDuSurveillance e WHERE e.date = :date AND e.statut = :statut")
    long countByDateAndStatut(@Param("date") LocalDate date, @Param("statut") String statut);
    
    List<EmploiDuSurveillance> findByDate(LocalDate date);
    
    List<EmploiDuSurveillance> findByDateBetween(LocalDate dateDebut, LocalDate dateFin);
    
    List<EmploiDuSurveillance> findByStatut(String statut);

}