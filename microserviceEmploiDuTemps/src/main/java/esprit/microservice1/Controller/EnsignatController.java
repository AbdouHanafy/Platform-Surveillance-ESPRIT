package esprit.microservice1.Controller;

import esprit.microservice1.AffectationModuleDTO;
import esprit.microservice1.Entity.Enseignant;
import esprit.microservice1.Entity.EnseignantDTO;
import esprit.microservice1.Entity.MyModule;
import esprit.microservice1.Entity.UnitePedagogique;
import esprit.microservice1.Repository.EnsignatRepository;
import esprit.microservice1.Repository.ModuleRepository;
import esprit.microservice1.Service.EnsignatService;
import esprit.microservice1.Service.ModuleService;
import esprit.microservice1.Service.UnitePedagogiqueService;
import esprit.microservice1.UserEnseignantDTO;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@AllArgsConstructor
@RestController
@RequestMapping("/ensignat")
@CrossOrigin("*")
public class EnsignatController {

    private final EnsignatService ensignatService;
    private final EnsignatRepository enseignantRepository;
    private final ModuleService moduleService;
    private final ModuleRepository moduleRepository;

    private final UnitePedagogiqueService unitePedagogiqueService;
    @GetMapping("/unite-pedagogiques")
    public List<UnitePedagogique> getAllUnites() {
        return unitePedagogiqueService.getAllUnites();
    }

   /* @PostMapping("/addEnsignat")
    public Enseignant addEnsignat(@RequestBody Enseignant e) {
        return ensignatService.addEnsignat(e);
    }

    */


    @PostMapping("/registerEnseignant")
    public ResponseEntity<Enseignant> registerUserAndEnseignant(@RequestBody UserEnseignantDTO dto) {
        Enseignant enseignant = ensignatService.addUserAndEnseignant(dto.getUser(), dto.getEnseignant());
        return ResponseEntity.ok(enseignant);
    }

    /// //////////////////////////////
    @GetMapping("/getAllEnseignants")
    public List<Enseignant> getAllEnseignants() {
        return enseignantRepository.findAll(); // récupère tout y compris unitePedagogique
    }

    @GetMapping("/matricule/{matricule}")
    public Enseignant getByMatricule(@PathVariable String matricule) {
        return enseignantRepository.findByMatricule(matricule)
                .orElseThrow(() -> new RuntimeException("Aucun enseignant trouvé avec ce matricule"));
    }

    @GetMapping("/id/{id}")
    public ResponseEntity<Enseignant> getEnseignantById(@PathVariable Long id) {
        return ensignatService.getEnseignantById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/modules")
    public List<MyModule> getAllModules() {
        return moduleService.getAllModules();
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<Enseignant> updateEnseignant(@PathVariable Long id, @RequestBody Enseignant updatedEnseignant) {
        try {
            Enseignant updated = ensignatService.updateEnseignant(id, updatedEnseignant);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }


    @DeleteMapping("/deleteEnsignat/{id}")
    public ResponseEntity<Void> deleteEnsignat(@PathVariable Long id) {
        ensignatService.deleteEnseignant(id);
        return ResponseEntity.noContent().build();
    }
    @PostMapping("/affecterModules")
    public ResponseEntity<Enseignant> affecterModules(@RequestBody AffectationModuleDTO dto) {
        Enseignant updated = ensignatService.affecterModules(dto.getEnseignantId(), dto.getModuleIds());
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/enseignants/modules")
    public List<Enseignant> getAllEnseignantsWithModules() {
        return enseignantRepository.findAllWithModules();
    }



    @GetMapping("/modules/by-unite/{uniteId}")
    public List<MyModule> getModulesByUnite(@PathVariable Long uniteId) {
        return moduleRepository.findByUnitePedagogiqueId(uniteId);
    }

    // Récupérer tous les enseignants avec leurs modules + UP
    @GetMapping("/avec-modules")
    public List<Enseignant> getAllEnseignantsAvecModules() {
        // Charger tous enseignants avec UP et modules avec UP (fetch eager)
        return enseignantRepository.findAll();
        // Assure-toi que la relation est bien fetchée (via @EntityGraph ou fetch = EAGER)
    }

    @DeleteMapping("/{enseignantId}/modules/{moduleId}")
    public ResponseEntity<Void> supprimerModuleAffecte(
            @PathVariable Long enseignantId,
            @PathVariable Long moduleId) {

        boolean success = ensignatService.supprimerModuleAffecte(enseignantId, moduleId);

        if (success) {
            return ResponseEntity.noContent().build(); // 204 No Content
        } else {
            return ResponseEntity.notFound().build(); // 404 Not Found
        }
    }
}
