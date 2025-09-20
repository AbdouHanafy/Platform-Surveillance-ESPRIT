package esprit.microservicegestiondesfraude.Controller;



import esprit.microservicegestiondesfraude.Entity.Fraude;
import esprit.microservicegestiondesfraude.Entity.FraudeRequestDTO;
import esprit.microservicegestiondesfraude.Entity.FraudeTableDTO;
import esprit.microservicegestiondesfraude.Entity.StatutFraude;
import esprit.microservicegestiondesfraude.Repository.FraudeRepository;
import esprit.microservicegestiondesfraude.Service.FraudeService;
import esprit.microservicegestiondesfraude.UserClient;
import esprit.microservicegestiondesfraude.UserDTO;
import jakarta.annotation.security.PermitAll;
import lombok.AllArgsConstructor;


import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/fraudes")
@AllArgsConstructor
@CrossOrigin("*")
@PermitAll
public class FraudeController {

    private final FraudeService fraudeService;
    private final UserClient userClient;
    private final FraudeRepository fraudeRepository;



    /**
     * Déclarer une fraude
     * L'enseignant connecté est récupéré via le JWT
     */

    @PostMapping("/declare")
    public ResponseEntity<Fraude> declareFraude(@RequestBody FraudeRequestDTO request) {

        // Pour tester, on peut prendre le matricule directement depuis le DTO si tu veux
        String currentMatricule = request.getMatriculeEnseignant();

        // Appeler microservice User pour récupérer l'enseignant
        UserDTO user = userClient.getUserByMatricule(currentMatricule);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }

        // Créer la fraude
        Fraude fraude = new Fraude();
        fraude.setNomEtudiant(request.getNomEtudiant());
        fraude.setMatriculeEtudiant(request.getMatricule()); // matricule étudiant
        fraude.setNomGroupe(request.getNomGroupe());
        fraude.setGroupeId(request.getGroupeId());
        fraude.setType(request.getType()); // type de fraude envoyé depuis le formulaire
        fraude.setDescription(request.getDescription());
        fraude.setDateDeclaration(LocalDateTime.now());
        fraude.setEnseignantId(user.getId());
        fraude.setNomEnseignant(request.getNomEnseignant());
        fraude.setMatriculeEnseignant(request.getMatriculeEnseignant());
        fraude.setStatut(StatutFraude.EN_ATTENTE);

        Fraude saved = fraudeRepository.save(fraude);

        return ResponseEntity.ok(saved);
    }

    /**
     * Lister toutes les fraudes sous forme de tableau
     */
    @GetMapping("/table")
    public ResponseEntity<List<FraudeTableDTO>> getTableFraudes() {
        List<FraudeTableDTO> table = fraudeService.getTableFraudes();
        return ResponseEntity.ok(table);
    }

    /**
     * Traiter une fraude et ajouter un rapport
     */
    @GetMapping("/all")
    public ResponseEntity<List<Fraude>> getAllFraudes() {
        return ResponseEntity.ok(fraudeRepository.findAll());
    }

    @PutMapping("/traiter/{id}")
    public ResponseEntity<Fraude> traiterFraude(@PathVariable Long id, @RequestParam String rapport) {
        Fraude f = fraudeService.traiterFraude(id, rapport);
        return ResponseEntity.ok(f);
    }

    @PutMapping("/archiver/{id}")
    public ResponseEntity<Fraude> archiverFraude(@PathVariable Long id) {
        Fraude f = fraudeService.archiverFraude(id);
        return ResponseEntity.ok(f);
    }

    /**
     * Lister toutes les fraudes en cours
     */
    @GetMapping("/EnATTENTE")
    public ResponseEntity<List<Fraude>> getFraudesEnCours() {
        return ResponseEntity.ok(fraudeService.getFraudesEnATTENTE());
    }

    /**
     * Lister toutes les fraudes par matricule étudiant
     */
    @GetMapping("/matricule/{matricule}")
    public ResponseEntity<List<Fraude>> getFraudesParMatricule(@PathVariable String matricule) {
        return ResponseEntity.ok(fraudeService.getFraudesParMatricule(matricule));
    }


    @GetMapping("/statut")
    public ResponseEntity<List<Fraude>> getFraudesByStatut(@RequestParam(required = false) StatutFraude statut) {
        if (statut == null) {
            return ResponseEntity.ok(fraudeRepository.findAll());
        }
        return ResponseEntity.ok(fraudeRepository.findByStatut(statut));
    }

}
