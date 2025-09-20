package esprit.microservice1.Controller;

import esprit.microservice1.Entity.ExamenChrono;
import esprit.microservice1.Entity.ExamenChronoRequestDTO;
import esprit.microservice1.Entity.Groupe;
import esprit.microservice1.Service.ExamenChronoService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/examen-chrono")
@AllArgsConstructor
@CrossOrigin("*")
public class ExamenChronoController {

    private final ExamenChronoService examenChronoService;

    // 👉 Créer un nouvel ExamenChrono
    @PostMapping("/create")
    public ResponseEntity<ExamenChrono> createExamen(@RequestBody ExamenChronoRequestDTO request) {
        try {
            ExamenChrono created = examenChronoService.createExamenChrono(request);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    // 👉 Lister tous les examens chrono
    @GetMapping("/all")
    public ResponseEntity<List<ExamenChrono>> getAllExams() {
        return ResponseEntity.ok(examenChronoService.getAllChronos());
    }

    // 👉 Obtenir un examen par son ID
    @GetMapping("/{id}")
    public ResponseEntity<ExamenChrono> getExamenById(@PathVariable Long id) {
        ExamenChrono examen = examenChronoService.getById(id);
        if (examen != null) {
            return ResponseEntity.ok(examen);
        } else {
            return ResponseEntity.notFound().build();
        }
    }




}
