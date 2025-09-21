package esprit.microservice1.Controller;


import esprit.microservice1.Entity.Groupe;
import esprit.microservice1.Entity.MyModule;
import esprit.microservice1.Service.ModuleService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@AllArgsConstructor
@RestController
@RequestMapping("/modules")
@CrossOrigin(origins = "*")
public class ModuleController {


    private ModuleService moduleService;

    @GetMapping
    public ResponseEntity<List<MyModule>> getAll() {
        return ResponseEntity.ok(moduleService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MyModule> getById(@PathVariable Long id) {
        Optional<MyModule> module = moduleService.findById(id);
        return module.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<MyModule> create(@RequestBody MyModule module) {
        MyModule saved = moduleService.save(module);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MyModule> update(@PathVariable Long id, @RequestBody MyModule module) {
        Optional<MyModule> existing = moduleService.findById(id);
        if (existing.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        module.setId(id);
        MyModule updated = moduleService.save(module);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        moduleService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // Upload fichier Excel pour import
    @PostMapping("/import")
    public ResponseEntity<?> importExcel(@RequestParam("file") MultipartFile file) {
        try {
            List<MyModule> importedModules = moduleService.importFromExcel(file);
            return ResponseEntity.ok(importedModules);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Erreur lors de l'import: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }

    }

    @GetMapping("/allGroupes")
    public List<Groupe> getAllGroupes() {
        return moduleService.findAllGroupes();
    }

    @GetMapping("/groupe/{id}")
    public ResponseEntity<Groupe> getGroupeById(@PathVariable Long id) {
        return moduleService.getGroupeById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }


    @PostMapping("/createGroupe")
    public Groupe createGroupe(@RequestBody Groupe groupe) {
        return moduleService.createGroupe(groupe);
    }

    @PutMapping("/updateGroupe/{id}")
    public ResponseEntity<Groupe> updateGroupe(@PathVariable Long id, @RequestBody Groupe groupe) {
        try {
            return ResponseEntity.ok(moduleService.updateGroupe(id, groupe));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/deleteGroupe/{id}")
    public ResponseEntity<Void> deleteGroupe(@PathVariable Long id) {
        moduleService.deleteGroupe(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/exists/{nomClasse}")
    public boolean existsByNomClasse(@PathVariable String nomClasse) {
        return moduleService.existsByNomClasse(nomClasse);
    }
}