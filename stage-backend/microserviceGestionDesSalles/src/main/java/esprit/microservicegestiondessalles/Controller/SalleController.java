package esprit.microservicegestiondessalles.Controller;

import esprit.microservicegestiondessalles.Entity.Salle;
import esprit.microservicegestiondessalles.Repository.SalleRepository;
import esprit.microservicegestiondessalles.Service.SalleService;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/salles")
@AllArgsConstructor
@CrossOrigin("*")
public class SalleController {

    @Autowired
    private SalleService salleService;
    private SalleRepository salleRepository;

    @GetMapping
    public List<Salle> getAll() {
        return salleService.getAllSalles();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Salle> getById(@PathVariable Long id) {
        return salleService.getSalleById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/batch")
    public ResponseEntity<List<Salle>> getSallesByIds(@RequestParam List<Long> ids) {
        List<Salle> salles = salleService.getSallesByIds(ids);
        return ResponseEntity.ok(salles);
    }



    @PostMapping
    public Salle create(@RequestBody Salle salle) {
        return salleService.createSalle(salle);
    }

    @PutMapping("/{id}")
    public Salle update(@PathVariable Long id, @RequestBody Salle salle) {
        return salleService.updateSalle(id, salle);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        salleService.deleteSalle(id);
        return ResponseEntity.noContent().build();
    }


    @GetMapping("/{salleId}/disponibilite")
    public ResponseEntity<Boolean> verifierDisponibiliteSalle(
            @PathVariable Long salleId,

            @Parameter(description = "Date de réservation", schema = @Schema(type = "string", format = "date"))
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,

            @Parameter(description = "Heure de début (HH:mm)", schema = @Schema(type = "string", pattern = "^([01]?[0-9]|2[0-3]):[0-5][0-9]$"))
            @RequestParam @DateTimeFormat(pattern = "HH:mm") LocalTime heureDebut,

            @Parameter(description = "Heure de fin (HH:mm)", schema = @Schema(type = "string", pattern = "^([01]?[0-9]|2[0-3]):[0-5][0-9]$"))
            @RequestParam @DateTimeFormat(pattern = "HH:mm") LocalTime heureFin) {

        boolean disponible = salleService.verifierDisponibiliteSalle(salleId, date, heureDebut, heureFin);
        return ResponseEntity.ok(disponible);
    }
    @GetMapping("/salles")
    public ResponseEntity<List<Salle>> getSallesAvecEtat() {
        List<Salle> salles = salleService.getSallesAvecEtatActuel();
        return ResponseEntity.ok(salles);
    }


    @PostMapping("/import")
    public ResponseEntity<String> importerFichier(@RequestParam("file") MultipartFile file) {
        try {
            salleService.importerSallesDepuisExcel(file);
            return ResponseEntity.ok("Importation réussie !");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erreur : " + e.getMessage());
        }
    }

    @GetMapping("/disponibles")
    public List<Long> getAvailableSalleIds() {
        return salleRepository.findByEstReserveeFalse()
                .stream()
                .map(Salle::getId)
                .collect(Collectors.toList());
    }
}
