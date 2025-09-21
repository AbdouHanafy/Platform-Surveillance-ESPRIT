package esprit.microservice1.Controller;

import esprit.microservice1.Entity.*;
import esprit.microservice1.Service.AffectationService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@AllArgsConstructor
@RequestMapping("/affectations")
@CrossOrigin(origins = "*")
public class AffectationModuleGroupeController {

    private final AffectationService affectationService;

    // ✅ Affecter un module à plusieurs groupes pour une période
    @PostMapping("/affecter")
    public ResponseEntity<String> affecterModuleAGroupes(@RequestBody AffectationRequestDTO request) {
        affectationService.affecterModuleAGroupes(request.getModuleId(), request.getGroupeIds(), request.getPeriode());
        return ResponseEntity.ok("Affectation effectuée avec succès !");
    }

    // ✅ Récupérer toutes les affectations
    @GetMapping("/all")
    public List<AffectationModuleGroupe> getAllAffectations() {
        return affectationService.getAllAffectations();
    }

    // ✅ Supprimer une affectation
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAffectation(@PathVariable Long id) {
        affectationService.deleteAffectation(id);
        return ResponseEntity.noContent().build();
    }


    @GetMapping("/modules-by-periode")
    public ResponseEntity<List<MyModule>> getModulesByPeriode(@RequestParam Periode periode) {
        return ResponseEntity.ok(affectationService.getModulesByPeriode(periode));
    }

    @GetMapping("/groupes-by-module-and-periode")
    public ResponseEntity<List<Groupe>> getGroupesByModuleAndPeriode(
            @RequestParam Long moduleId,
            @RequestParam Periode periode) {
        return ResponseEntity.ok(affectationService.getGroupesByModuleAndPeriode(moduleId, periode));
    }
}

