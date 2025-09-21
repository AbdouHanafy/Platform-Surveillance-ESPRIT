package esprit.microservicegestiondessalles.Repository;

import esprit.microservicegestiondessalles.Entity.HistoriqueReservation;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

@Repository
public interface HistoriqueReservationRepository extends JpaRepository<HistoriqueReservation, Long> {
    List<HistoriqueReservation> findByReservationIdOrderByDateModificationDesc(Long reservationId);
    List<HistoriqueReservation> findByReservation_Salle_IdOrderByDateModificationDesc(Long salleId);

}

