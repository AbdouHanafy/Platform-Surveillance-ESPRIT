package esprit.microservice1.Controller;

import esprit.microservice1.Entity.EmploiDuSurveillance;
import esprit.microservice1.Entity.Enseignant;
import esprit.microservice1.Service.AutoAffectationEnseignantService;
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
@RequestMapping("/enseignants/auto-affectation")
@AllArgsConstructor
@CrossOrigin("*")
@Tag(name = "Auto-Affectation Enseignants", description = "API pour l'affectation automatique des enseignants")
public class AutoAffectationEnseignantController {

    private final AutoAffectationEnseignantService autoAffectationService;

    @PostMapping("/affecter")
    @Operation(summary = "Affectation automatique d'un enseignant", 
               description = "Trouve et affecte automatiquement le meilleur enseignant pour un module donné")
    public ResponseEntity<?> affecterEnseignantAutomatiquement(
            @RequestBody AffectationEnseignantRequest request) {
        
        try {
            EmploiDuSurveillance affectation = autoAffectationService.affecterEnseignantAutomatiquement(
                request.getModuleId(),
                request.getModuleLibelle(),
                request.getGroupeId(),
                request.getSalleId(),
                request.getDate(),
                request.getHeureDebut(),
                request.getHeureFin(),
                request.getTypeExamen()
            );
            
            return ResponseEntity.ok(new AffectationEnseignantResponse(
                "Affectation automatique d'enseignant réussie",
                affectation
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse("Erreur lors de l'affectation", e.getMessage()));
        }
    }

    @GetMapping("/enseignant-optimal")
    @Operation(summary = "Trouve l'enseignant optimal", 
               description = "Retourne le meilleur enseignant pour un module sans créer d'affectation")
    public ResponseEntity<?> findOptimalEnseignant(
            @Parameter(description = "ID du module") @RequestParam Long moduleId,
            @Parameter(description = "Libellé du module") @RequestParam String moduleLibelle,
            @Parameter(description = "Date souhaitée") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @Parameter(description = "Heure de début") @RequestParam @DateTimeFormat(pattern = "HH:mm") LocalTime heureDebut,
            @Parameter(description = "Heure de fin") @RequestParam @DateTimeFormat(pattern = "HH:mm") LocalTime heureFin) {
        
        Optional<Enseignant> enseignantOptimal = autoAffectationService.findOptimalEnseignant(
            moduleId, moduleLibelle, date, heureDebut, heureFin);
        
        if (enseignantOptimal.isPresent()) {
            return ResponseEntity.ok(enseignantOptimal.get());
        } else {
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse("Aucun enseignant disponible", 
                           "Aucun enseignant n'est disponible pour les critères demandés"));
        }
    }

    @GetMapping("/disponibilite")
    @Operation(summary = "Vérifier la disponibilité d'un enseignant")
    public ResponseEntity<Boolean> verifierDisponibilite(
            @Parameter(description = "ID de l'enseignant") @RequestParam Long enseignantId,
            @Parameter(description = "Date") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @Parameter(description = "Heure de début") @RequestParam @DateTimeFormat(pattern = "HH:mm") LocalTime heureDebut,
            @Parameter(description = "Heure de fin") @RequestParam @DateTimeFormat(pattern = "HH:mm") LocalTime heureFin) {
        
        boolean disponible = autoAffectationService.isEnseignantDisponible(enseignantId, date, heureDebut, heureFin);
        return ResponseEntity.ok(disponible);
    }

    @GetMapping("/stats/affectation")
    @Operation(summary = "Statistiques d'affectation des enseignants")
    public ResponseEntity<AutoAffectationEnseignantService.EnseignantAffectationStats> getAffectationStats(
            @Parameter(description = "Date pour les statistiques") 
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        
        AutoAffectationEnseignantService.EnseignantAffectationStats stats = 
                autoAffectationService.getAffectationStats(date);
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/charge-moyenne")
    @Operation(summary = "Charge de travail moyenne des enseignants")
    public ResponseEntity<Double> getChargeMoyenne(
            @Parameter(description = "Date") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        
        double charge = autoAffectationService.getChargeTravaildMoyenne(date);
        return ResponseEntity.ok(charge);
    }

    // Classes internes pour les DTOs
    public static class AffectationEnseignantRequest {
        private Long moduleId;
        private String moduleLibelle;
        private Long groupeId;
        private Long salleId;
        private LocalDate date;
        private LocalTime heureDebut;
        private LocalTime heureFin;
        private String typeExamen;

        // Constructeurs
        public AffectationEnseignantRequest() {}

        // Getters et Setters
        public Long getModuleId() { return moduleId; }
        public void setModuleId(Long moduleId) { this.moduleId = moduleId; }

        public String getModuleLibelle() { return moduleLibelle; }
        public void setModuleLibelle(String moduleLibelle) { this.moduleLibelle = moduleLibelle; }

        public Long getGroupeId() { return groupeId; }
        public void setGroupeId(Long groupeId) { this.groupeId = groupeId; }

        public Long getSalleId() { return salleId; }
        public void setSalleId(Long salleId) { this.salleId = salleId; }

        public LocalDate getDate() { return date; }
        public void setDate(LocalDate date) { this.date = date; }

        public LocalTime getHeureDebut() { return heureDebut; }
        public void setHeureDebut(LocalTime heureDebut) { this.heureDebut = heureDebut; }

        public LocalTime getHeureFin() { return heureFin; }
        public void setHeureFin(LocalTime heureFin) { this.heureFin = heureFin; }

        public String getTypeExamen() { return typeExamen; }
        public void setTypeExamen(String typeExamen) { this.typeExamen = typeExamen; }
    }

    public static class AffectationEnseignantResponse {
        private final String message;
        private final EmploiDuSurveillance affectation;

        public AffectationEnseignantResponse(String message, EmploiDuSurveillance affectation) {
            this.message = message;
            this.affectation = affectation;
        }

        // Getters
        public String getMessage() { return message; }
        public EmploiDuSurveillance getAffectation() { return affectation; }
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

