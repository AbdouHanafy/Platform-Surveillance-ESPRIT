package esprit.microservicegestiondessalles.Repository;

import esprit.microservicegestiondessalles.Entity.ReservationSalle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface ReservationSalleRepository extends JpaRepository<ReservationSalle, Long> {
    List<ReservationSalle> findBySalleIdOrderByDateExamenAsc(Long salleId);


    @Query("SELECT r FROM ReservationSalle r WHERE r.salle.id = :salleId AND (r.dateExamen > :dateExamen OR (r.dateExamen = :dateExamen AND r.heureFin > :heureFin)) ORDER BY r.dateExamen, r.heureDebut")
    List<ReservationSalle> findReservationsFuturesParSalle(@Param("salleId") Long salleId,
                                                           @Param("dateExamen") LocalDate dateExamen,
                                                           @Param("heureFin") LocalTime heureFin);

    List<ReservationSalle> findBySalleIdAndDateExamenAfterOrderByDateExamenAscHeureDebutAsc(Long salleId, LocalDate today);


    @Query("SELECT COUNT(r) FROM ReservationSalle r WHERE r.enseignantId = :enseignantId AND r.dateExamen = :date " +
            "AND ( (r.heureDebut < :heureFin) AND (r.heureFin > :heureDebut) )")
    int countConflits(@Param("enseignantId") Long enseignantId,
                      @Param("date") LocalDate date,
                      @Param("heureDebut") LocalTime heureDebut,
                      @Param("heureFin") LocalTime heureFin);

    @Query("SELECT COUNT(r.salle) FROM ReservationSalle r WHERE r.salle.id = :salleId AND r.dateExamen = :date " +
            "AND ( (r.heureDebut < :heureFin) AND (r.heureFin > :heureDebut) )")
    int countEnseignantsReservantSallePourPeriode(@Param("salleId") Long salleId,
                                                  @Param("date") LocalDate date,
                                                  @Param("heureDebut") LocalTime heureDebut,
                                                  @Param("heureFin") LocalTime heureFin);

    boolean existsBySalleIdAndDateExamenAfter(Long salleId, LocalDate date);


    @Query("SELECT r FROM ReservationSalle r WHERE r.dateExamen = :date AND :time BETWEEN r.heureDebut AND r.heureFin")
    List<ReservationSalle> findReservationsActuelles(LocalDate date, LocalTime time);


    @Query("SELECT COUNT(r) FROM ReservationSalle r WHERE r.salle.id = :salleId AND r.dateExamen = :date " +
            "AND ((:heureDebut < r.heureFin) AND (:heureFin > r.heureDebut))")
    int countReservationsConflits(@Param("salleId") Long salleId,
                                  @Param("date") LocalDate date,
                                  @Param("heureDebut") LocalTime heureDebut,
                                  @Param("heureFin") LocalTime heureFin);



    List<ReservationSalle> findBySalleIdAndDateExamen(Long salleId, LocalDate dateExamen);

    // Nouvelles méthodes pour l'affectation automatique
    List<ReservationSalle> findByDateExamen(LocalDate dateExamen);
    
    List<ReservationSalle> findByTypeReservation(String typeReservation);
    
    List<ReservationSalle> findByModuleIdAndDateExamen(Long moduleId, LocalDate dateExamen);
    
    List<ReservationSalle> findByGroupeIdAndDateExamen(Long groupeId, LocalDate dateExamen);
    
    @Query("SELECT COUNT(r) FROM ReservationSalle r WHERE r.dateExamen = :date AND r.statut = 'Occupé'")
    int countReservationsForDate(@Param("date") LocalDate date);

}