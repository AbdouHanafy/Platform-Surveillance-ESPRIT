package esprit.microservicegestiondesfraude.Service;

import esprit.microservicegestiondesfraude.*;
import esprit.microservicegestiondesfraude.Entity.Fraude;
import esprit.microservicegestiondesfraude.Entity.FraudeTableDTO;
import esprit.microservicegestiondesfraude.Entity.StatutFraude;
import esprit.microservicegestiondesfraude.Repository.FraudeRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@AllArgsConstructor
public class FraudeService {

    private final FraudeRepository fraudeRepository;
    private final EnseignantClient enseignantClient;
    private final GroupeClient groupeClient;


    public Fraude signalerFraude(Fraude fraude) {
        fraude.setDateDeclaration(LocalDateTime.now());
        fraude.setStatut(StatutFraude.EN_ATTENTE);
        return fraudeRepository.save(fraude);
    }


    public List<FraudeTableDTO> getTableFraudes() {
        return fraudeRepository.findAll().stream()
                .map(f -> {
                    GroupeDTO groupe = groupeClient.getGroupeById(f.getGroupeId());
                    EnseignantDTO enseignant = enseignantClient.getEnseignantById(f.getEnseignantId());
                    return new FraudeTableDTO(
                            f.getNomEtudiant(),
                            groupe.getNomClasse(),
                            enseignant.getNom(),
                            f.getDateDeclaration(),
                            f.getDescription(),
                            f.getStatut().name()
                    );
                })
                .toList();
    }


    public Fraude traiterFraude(Long id, String rapport) {
        Fraude f = fraudeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Fraude non trouvée"));
        f.setRapport(rapport);
        f.setStatut(StatutFraude.RESOLUE);
        return fraudeRepository.save(f);
    }


    public Fraude archiverFraude(Long id) {
        Fraude f = fraudeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Fraude non trouvée"));
        f.setStatut(StatutFraude.ARCHIVEE);
        return fraudeRepository.save(f);
    }

    public List<Fraude> getFraudesEnATTENTE() {
        return fraudeRepository.findByStatut(StatutFraude.EN_ATTENTE);
    }


    public List<Fraude> getFraudesParMatricule(String matricule) {
        return fraudeRepository.findByMatriculeEtudiant(matricule);
    }
}
