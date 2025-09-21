package esprit.microservicegestiondessalles.Repository;

import esprit.microservicegestiondessalles.Entity.Salle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SalleRepository extends JpaRepository<Salle, Long> {


    boolean existsByNomAndBlocAndEtage(String nom, String bloc, int etage);

    Optional<Salle> findByNomAndBlocAndEtage(String nom, String bloc, int etage);
    Optional<Salle> findByNom(String nom);
    boolean existsByNom(String nom);
    List<Salle> findByEstReserveeFalse();
    
    // Nouvelle méthode pour l'affectation automatique
    List<Salle> findByCapaciteGreaterThanEqual(int capacite);

}

