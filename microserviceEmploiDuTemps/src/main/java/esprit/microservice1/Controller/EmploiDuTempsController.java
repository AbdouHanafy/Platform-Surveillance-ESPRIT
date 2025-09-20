package esprit.microservice1.Controller;



import esprit.microservice1.Entity.EmploiDuSurveillance;
import esprit.microservice1.Entity.Groupe;
import esprit.microservice1.Repository.GroupeRepository;
import esprit.microservice1.SalleDTO;
import esprit.microservice1.Service.EmploiDuTempsService;
import esprit.microservice1.Service.ModuleService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/emplois")
@AllArgsConstructor
@CrossOrigin("*")
public class EmploiDuTempsController {

    private final EmploiDuTempsService emploiService;
    private final ModuleService moduleService;
    private final GroupeRepository groupeRepository;


    @PostMapping("/planifier")
    public ResponseEntity<?> planifier(@RequestBody EmploiDuSurveillance surveillance) {
        try {
            EmploiDuSurveillance saved = emploiService.planifierSurveillance(surveillance);
            return ResponseEntity.ok(saved);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/enseignant/{id}")
    public List<EmploiDuSurveillance> getSurveillancesParEnseignant(@PathVariable Long id) {
        return emploiService.getSurveillancesParEnseignant(id);
    }

    @GetMapping("/salles/{id}")
    public ResponseEntity<SalleDTO> getSalleParId(@PathVariable Long id) {
        try {
            SalleDTO salle = emploiService.getSalleParId(id);
            return ResponseEntity.ok(salle);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }


    @GetMapping("/groupes/all")
    List<Groupe> getAllGroupes(){
        return emploiService.getAllGroupes();
    }


  //groupe by id
  @GetMapping("/groupe/{id}")
  public ResponseEntity<Groupe> getGroupeById(@PathVariable Long id) {
      return groupeRepository.findById(id)
              .map(groupe -> ResponseEntity.ok(groupe))
              .orElse(ResponseEntity.notFound().build());
  }

  // Get all emplois du temps
  @GetMapping("/all")
  public List<EmploiDuSurveillance> getAllEmplois() {
      return emploiService.getAllEmplois();
  }

  // Get emplois by date
  @GetMapping("/date")
  public List<EmploiDuSurveillance> getEmploisByDate(@RequestParam String date) {
      return emploiService.getEmploisByDate(date);
  }

  // Update emploi du temps
  @PutMapping("/{id}")
  public ResponseEntity<?> updateEmploi(@PathVariable Long id, @RequestBody EmploiDuSurveillance emploi) {
      try {
          emploi.setId(id);
          EmploiDuSurveillance updated = emploiService.updateEmploi(emploi);
          return ResponseEntity.ok(updated);
      } catch (RuntimeException e) {
          return ResponseEntity.badRequest().body(e.getMessage());
      }
  }

}
