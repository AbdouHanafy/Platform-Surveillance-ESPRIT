package esprit.microservicegestiondessalles.Controller;


import esprit.microservicegestiondessalles.EmploiDuTempsDetailDTO;
import esprit.microservicegestiondessalles.Entity.EmploiDuTemps;
import esprit.microservicegestiondessalles.GroupeDTO;
import esprit.microservicegestiondessalles.Service.EmploiDuTempsService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/emploi_enseignant")
@AllArgsConstructor
@CrossOrigin("*")
public class EmploiDuTempsController {

    private final EmploiDuTempsService emploiDuTempsService;



    @PostMapping("/create")
    public ResponseEntity<EmploiDuTemps> create(@RequestBody EmploiDuTemps emploiDuTemps) {
        EmploiDuTemps saved = emploiDuTempsService.create(emploiDuTemps);
        return ResponseEntity.ok(saved);
    }
    @GetMapping("/enseignant/{id}")
    public ResponseEntity<List<EmploiDuTemps>> getEmploiDuTempsByEnseignant(@PathVariable Long id) {
        List<EmploiDuTemps> emploi = emploiDuTempsService.getByEnseignantId(id);
        return ResponseEntity.ok(emploi);
    }

    @GetMapping("/details/enseignant/{id}")
    public ResponseEntity<List<EmploiDuTempsDetailDTO>> getDetails(@PathVariable Long id) {
        return ResponseEntity.ok(emploiDuTempsService.getDetailsByEnseignant(id));
    }
    @GetMapping("/groupes/all")
    public ResponseEntity<List<GroupeDTO>> getAllGroupes() {
        return ResponseEntity.ok(emploiDuTempsService.getAllGroupes());
    }

    @GetMapping("/filter")
    public ResponseEntity<List<EmploiDuTemps>> getEmploisFiltres(
            @RequestParam(required = false) Long enseignantId,
            @RequestParam(required = false) Long groupeId,
            @RequestParam(required = false) String date) {

        List<EmploiDuTemps> emploisFiltres = emploiDuTempsService.getEmploisFiltres(enseignantId, groupeId, date);
        return ResponseEntity.ok(emploisFiltres);
    }
    @GetMapping("/salle/{salleNom}")
    public ResponseEntity<List<EmploiDuTemps>> getEmploisParSalle(@PathVariable String salleNom) {
        List<EmploiDuTemps> emplois = emploiDuTempsService.getBySalleNom(salleNom);
        return ResponseEntity.ok(emplois);
    }



}
