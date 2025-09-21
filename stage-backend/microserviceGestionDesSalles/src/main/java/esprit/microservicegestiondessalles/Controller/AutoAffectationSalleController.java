package esprit.microservicegestiondessalles.Controller;

import esprit.microservicegestiondessalles.Entity.ReservationSalle;
import esprit.microservicegestiondessalles.Entity.Salle;
import esprit.microservicegestiondessalles.Service.AutoAffectationSalleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;

@RestController
@RequestMapping("/salles/auto-affectation")
@AllArgsConstructor
@CrossOrigin("*")
@Tag(name = "Auto-Affectation Salles", description = "API pour l'affectation automatique des salles")
public class AutoAffectationSalleController {

    private final AutoAffectationSalleService autoAffectationService;

    @PostMapping("/affecter")
    @Operation(summary = "Affectation automatique d'une salle", 
               description = "Trouve et affecte automatiquement la meilleure salle pour un groupe donné")
    public ResponseEntity<?> affecterSalleAutomatiquement(
            @RequestBody AffectationSalleRequest request) {
        
        try {
            ReservationSalle reservation = autoAffectationService.affecterSalleAutomatiquement(
                request.getModuleId(),
                request.getGroupeId(),
                request.getEffectifGroupe(),
                request.getDate(),
                request.getHeureDebut(),
                request.getHeureFin(),
                request.getPeriode(),
                request.getTypeExamen()
            );
            
            return ResponseEntity.ok(new AffectationSalleResponse(
                "Affectation automatique réussie",
                reservation.getSalle(),
                reservation
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse("Erreur lors de l'affectation", e.getMessage()));
        }
    }

    @GetMapping("/salle-optimale")
    @Operation(summary = "Trouve la salle optimale", 
               description = "Retourne la meilleure salle pour un groupe sans créer de réservation")
    public ResponseEntity<?> findOptimalSalle(
            @Parameter(description = "Effectif du groupe") @RequestParam int effectifGroupe,
            @Parameter(description = "Date souhaitée") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @Parameter(description = "Heure de début") @RequestParam @DateTimeFormat(pattern = "HH:mm") LocalTime heureDebut,
            @Parameter(description = "Heure de fin") @RequestParam @DateTimeFormat(pattern = "HH:mm") LocalTime heureFin) {
        
        Optional<Salle> salleOptimale = autoAffectationService.findOptimalSalle(
            effectifGroupe, date, heureDebut, heureFin);
        
        if (salleOptimale.isPresent()) {
            return ResponseEntity.ok(salleOptimale.get());
        } else {
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse("Aucune salle disponible", 
                           "Aucune salle n'est disponible pour les critères demandés"));
        }
    }

    @GetMapping("/disponibilite")
    @Operation(summary = "Vérifier la disponibilité d'une salle")
    public ResponseEntity<Boolean> verifierDisponibilite(
            @Parameter(description = "ID de la salle") @RequestParam Long salleId,
            @Parameter(description = "Date") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @Parameter(description = "Heure de début") @RequestParam @DateTimeFormat(pattern = "HH:mm") LocalTime heureDebut,
            @Parameter(description = "Heure de fin") @RequestParam @DateTimeFormat(pattern = "HH:mm") LocalTime heureFin) {
        
        boolean disponible = autoAffectationService.isSalleDisponible(salleId, date, heureDebut, heureFin);
        return ResponseEntity.ok(disponible);
    }

    @GetMapping("/stats/occupation")
    @Operation(summary = "Statistiques d'occupation des salles")
    public ResponseEntity<AutoAffectationSalleService.SalleOccupationStats> getOccupationStats(
            @Parameter(description = "Date pour les statistiques") 
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        
        AutoAffectationSalleService.SalleOccupationStats stats = 
                autoAffectationService.getOccupationStats(date);
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/taux-occupation")
    @Operation(summary = "Taux d'occupation des salles pour une date")
    public ResponseEntity<Double> getTauxOccupation(
            @Parameter(description = "Date") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        
        double taux = autoAffectationService.calculateTauxOccupation(date);
        return ResponseEntity.ok(taux);
    }

    // Classes internes pour les DTOs
    public static class AffectationSalleRequest {
        private Long moduleId;
        private Long groupeId;
        private int effectifGroupe;
        private LocalDate date;
        private LocalTime heureDebut;
        private LocalTime heureFin;
        private String periode;
        private String typeExamen;

        // Constructeurs
        public AffectationSalleRequest() {}

        // Getters et Setters
        public Long getModuleId() { return moduleId; }
        public void setModuleId(Long moduleId) { this.moduleId = moduleId; }

        public Long getGroupeId() { return groupeId; }
        public void setGroupeId(Long groupeId) { this.groupeId = groupeId; }

        public int getEffectifGroupe() { return effectifGroupe; }
        public void setEffectifGroupe(int effectifGroupe) { this.effectifGroupe = effectifGroupe; }

        public LocalDate getDate() { return date; }
        public void setDate(LocalDate date) { this.date = date; }

        public LocalTime getHeureDebut() { return heureDebut; }
        public void setHeureDebut(LocalTime heureDebut) { this.heureDebut = heureDebut; }

        public LocalTime getHeureFin() { return heureFin; }
        public void setHeureFin(LocalTime heureFin) { this.heureFin = heureFin; }

        public String getPeriode() { return periode; }
        public void setPeriode(String periode) { this.periode = periode; }

        public String getTypeExamen() { return typeExamen; }
        public void setTypeExamen(String typeExamen) { this.typeExamen = typeExamen; }
    }

    public static class AffectationSalleResponse {
        private final String message;
        private final Salle salleAssignee;
        private final ReservationSalle reservation;

        public AffectationSalleResponse(String message, Salle salleAssignee, ReservationSalle reservation) {
            this.message = message;
            this.salleAssignee = salleAssignee;
            this.reservation = reservation;
        }

        // Getters
        public String getMessage() { return message; }
        public Salle getSalleAssignee() { return salleAssignee; }
        public ReservationSalle getReservation() { return reservation; }
    }

    public static class ErrorResponse {
        private final String error;
        private final String message;

        public ErrorResponse(String error, String message) {
            this.error = error;
            this.message = message;
        }

        // Getters
        public String getError() { return error; }
        public String getMessage() { return message; }
    }
}

