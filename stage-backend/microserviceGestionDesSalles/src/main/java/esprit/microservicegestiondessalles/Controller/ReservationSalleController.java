package esprit.microservicegestiondessalles.Controller;

import esprit.microservicegestiondessalles.Entity.HistoriqueReservation;
import esprit.microservicegestiondessalles.Entity.ReservationSalle;
import esprit.microservicegestiondessalles.Entity.Salle;
import esprit.microservicegestiondessalles.Repository.ReservationSalleRepository;
import esprit.microservicegestiondessalles.Service.ReservationSalleService;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/reservations")
@CrossOrigin( "*") // à ajuster en prod pour sécurité

@AllArgsConstructor
public class ReservationSalleController {

    private final ReservationSalleService reservationService;
    private ReservationSalleRepository reservationSalleRepository;

    // Récupérer toutes les réservations d'une salle (passées et futures)
    @GetMapping("/salle/{salleId}")
    public List<ReservationSalle> getReservationsBySalle(@PathVariable Long salleId) {
        return reservationService.getReservationsBySalle(salleId);
    }

    // Créer une nouvelle réservation
    @PostMapping("/{matricule}")
    public ReservationSalle createReservation(@RequestBody ReservationSalle reservation,
                                              @PathVariable String matricule,
                                              @RequestParam(defaultValue = "création") String typeAction) {
        return reservationService.createReservation(reservation, matricule, typeAction);
    }

    // Mettre à jour une réservation existante
    @PutMapping("/{id}/{matricule}")
    public ReservationSalle updateReservation(@PathVariable Long id,
                                              @RequestBody ReservationSalle reservation,
                                              @PathVariable String matricule,
                                              @RequestParam(defaultValue = "modification") String typeAction) {
        return reservationService.updateReservation(id, reservation, matricule, typeAction);
    }

    // Supprimer une réservation
    @DeleteMapping("/{id}/{matricule}")
    public ResponseEntity<?> deleteReservation(@PathVariable Long id,
                                               @PathVariable String matricule) {
        reservationService.deleteReservation(id, matricule);
        return ResponseEntity.ok().build();
    }

    // Récupérer l'historique des modifications d'une réservation
    @GetMapping("/historique/{reservationId}")
    public List<HistoriqueReservation> getHistorique(@PathVariable Long reservationId) {
        return reservationService.getHistoriqueByReservation(reservationId);
    }

    // Récupérer toutes les salles avec leur statut actuel (ex: occupée maintenant ?)
    @GetMapping("/salles-status")
    public List<Salle> getAllSallesWithStatus() {
        return reservationService.getAllSallesWithStatus();
    }

    // Récupérer l'historique des réservations d'une salle
    @GetMapping("/salles/{salleId}/historique")
    public List<HistoriqueReservation> getHistoriqueParSalle(@PathVariable Long salleId) {
        return reservationService.getHistoriqueBySalle(salleId);
    }

    // --- Nouvelle route importante ---

    /**
     * Récupère les réservations futures pour une salle donnée.
     * Cela permet de connaître les créneaux occupés dans les jours à venir.
     *
     * @param salleId l'id de la salle
     * @return liste des réservations futures (date >= aujourd'hui)
     */
    @GetMapping("/salle/{salleId}/disponibilites")
    public List<ReservationSalle> getReservationsFuturesParSalle(@PathVariable Long salleId) {
        LocalDate aujourdHui = LocalDate.now();
        LocalTime maintenant = LocalTime.now();
        // On récupère les réservations à partir d'aujourd'hui (incluant celles du jour en cours)
        return reservationService.getReservationsFuturesParSalle(salleId, aujourdHui, maintenant);
    }




}
