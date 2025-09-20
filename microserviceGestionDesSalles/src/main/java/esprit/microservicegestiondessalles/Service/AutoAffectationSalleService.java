package esprit.microservicegestiondessalles.Service;

import esprit.microservicegestiondessalles.Entity.ReservationSalle;
import esprit.microservicegestiondessalles.Entity.Salle;
import esprit.microservicegestiondessalles.Repository.ReservationSalleRepository;
import esprit.microservicegestiondessalles.Repository.SalleRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class AutoAffectationSalleService {

    private final SalleRepository salleRepository;
    private final ReservationSalleRepository reservationSalleRepository;

    /**
     * Trouve automatiquement la meilleure salle pour un groupe donné
     * Algorithme d'optimisation basé sur:
     * 1. Capacité suffisante (avec marge de sécurité de 10%)
     * 2. Disponibilité pendant le créneau demandé
     * 3. Optimisation de l'espace (salle la plus proche de l'effectif requis)
     */
    public Optional<Salle> findOptimalSalle(int effectifGroupe, LocalDate date, 
                                          LocalTime heureDebut, LocalTime heureFin) {
        
        // Calculer la capacité requise avec marge de sécurité
        int capaciteRequise = (int) Math.ceil(effectifGroupe * 1.1);
        
        // Récupérer toutes les salles avec capacité suffisante
        List<Salle> sallesCapaciteSuffisante = salleRepository.findByCapaciteGreaterThanEqual(capaciteRequise);
        
        // Filtrer les salles disponibles pour le créneau demandé
        List<Salle> sallesDisponibles = sallesCapaciteSuffisante.stream()
                .filter(salle -> isSalleDisponible(salle.getId(), date, heureDebut, heureFin))
                .collect(Collectors.toList());
        
        if (sallesDisponibles.isEmpty()) {
            return Optional.empty();
        }
        
        // Optimiser: choisir la salle avec la capacité la plus proche de l'effectif requis
        return sallesDisponibles.stream()
                .min((s1, s2) -> {
                    int diff1 = Math.abs(s1.getCapacite() - effectifGroupe);
                    int diff2 = Math.abs(s2.getCapacite() - effectifGroupe);
                    return Integer.compare(diff1, diff2);
                });
    }

    /**
     * Vérifie si une salle est disponible pour un créneau donné
     */
    public boolean isSalleDisponible(Long salleId, LocalDate date, 
                                   LocalTime heureDebut, LocalTime heureFin) {
        
        List<ReservationSalle> reservationsConflictuelles = reservationSalleRepository
                .findBySalleIdAndDateExamen(salleId, date);
        
        return reservationsConflictuelles.stream()
                .noneMatch(reservation -> hasTimeConflict(
                    reservation.getHeureDebut(), reservation.getHeureFin(),
                    heureDebut, heureFin
                ));
    }

    /**
     * Vérifie s'il y a conflit entre deux créneaux horaires
     */
    private boolean hasTimeConflict(LocalTime debut1, LocalTime fin1, 
                                  LocalTime debut2, LocalTime fin2) {
        return debut1.isBefore(fin2) && fin1.isAfter(debut2);
    }

    /**
     * Effectue une affectation automatique de salle
     */
    public ReservationSalle affecterSalleAutomatiquement(Long moduleId, Long groupeId, 
                                                        int effectifGroupe, LocalDate date,
                                                        LocalTime heureDebut, LocalTime heureFin,
                                                        String periode, String typeExamen) {
        
        Optional<Salle> salleOptimale = findOptimalSalle(effectifGroupe, date, heureDebut, heureFin);
        
        if (salleOptimale.isEmpty()) {
            throw new RuntimeException("Aucune salle disponible pour les critères demandés");
        }

        // Créer la réservation
        ReservationSalle reservation = new ReservationSalle();
        reservation.setSalle(salleOptimale.get());
        reservation.setDateExamen(date);
        reservation.setHeureDebut(heureDebut);
        reservation.setHeureFin(heureFin);
        reservation.setStatut("Occupé");
        
        // Ajouter des métadonnées pour l'affectation automatique
        reservation.setTypeReservation("AFFECTATION_AUTO");
        reservation.setPeriode(periode);
        reservation.setTypeExamen(typeExamen);
        reservation.setModuleId(moduleId);
        reservation.setGroupeId(groupeId);

        return reservationSalleRepository.save(reservation);
    }

    /**
     * Calcule le taux d'occupation des salles pour une date donnée
     */
    public double calculateTauxOccupation(LocalDate date) {
        List<Salle> toutesLesSalles = salleRepository.findAll();
        if (toutesLesSalles.isEmpty()) {
            return 0.0;
        }

        long sallesOccupees = toutesLesSalles.stream()
                .mapToLong(salle -> reservationSalleRepository
                        .findBySalleIdAndDateExamen(salle.getId(), date).size())
                .sum();

        return (double) sallesOccupees / toutesLesSalles.size() * 100;
    }

    /**
     * Récupère les statistiques d'occupation des salles
     */
    public SalleOccupationStats getOccupationStats(LocalDate date) {
        List<Salle> toutesLesSalles = salleRepository.findAll();
        int totalSalles = toutesLesSalles.size();
        
        long sallesOccupees = toutesLesSalles.stream()
                .filter(salle -> !reservationSalleRepository
                        .findBySalleIdAndDateExamen(salle.getId(), date).isEmpty())
                .count();

        long totalReservations = reservationSalleRepository
                .findByDateExamen(date).size();

        return new SalleOccupationStats(
                totalSalles,
                (int) sallesOccupees,
                (int) totalReservations,
                calculateTauxOccupation(date)
        );
    }

    // Classe interne pour les statistiques
    public static class SalleOccupationStats {
        private final int totalSalles;
        private final int sallesOccupees;
        private final int totalReservations;
        private final double tauxOccupation;

        public SalleOccupationStats(int totalSalles, int sallesOccupees, 
                                  int totalReservations, double tauxOccupation) {
            this.totalSalles = totalSalles;
            this.sallesOccupees = sallesOccupees;
            this.totalReservations = totalReservations;
            this.tauxOccupation = tauxOccupation;
        }

        // Getters
        public int getTotalSalles() { return totalSalles; }
        public int getSallesOccupees() { return sallesOccupees; }
        public int getTotalReservations() { return totalReservations; }
        public double getTauxOccupation() { return tauxOccupation; }
    }
}

