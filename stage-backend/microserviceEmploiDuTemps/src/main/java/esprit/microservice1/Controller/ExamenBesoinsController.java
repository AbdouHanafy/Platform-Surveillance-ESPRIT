package esprit.microservice1.Controller;

import esprit.microservice1.Entity.ExamenBesoins;
import esprit.microservice1.Service.ExamenService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/examen-besoins")
@AllArgsConstructor
@CrossOrigin("*")
public class ExamenBesoinsController {
    private final ExamenService service;

    @PostMapping
    public ResponseEntity<ExamenBesoins> save(@RequestBody ExamenBesoins examenBesoins) {
        return ResponseEntity.ok(service.save(examenBesoins));
    }

    @GetMapping
    public ResponseEntity<List<ExamenBesoins>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/periode/{periode}")
    public ResponseEntity<List<ExamenBesoins>> getByPeriode(@PathVariable String periode) {
        return ResponseEntity.ok(service.getByPeriode(periode));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
