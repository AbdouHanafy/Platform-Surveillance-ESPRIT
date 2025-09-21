package esprit.microservice1.Service;

import esprit.microservice1.Entity.Enseignant;
import esprit.microservice1.Entity.EnseignantDTO;
import esprit.microservice1.Entity.MyModule;
import esprit.microservice1.Entity.UnitePedagogique;
import esprit.microservice1.Repository.EnsignatRepository;
import esprit.microservice1.Repository.ModuleRepository;
import esprit.microservice1.Repository.UnitePedagogiqueRepository;
import esprit.microservice1.UserClient;
import esprit.microservice1.UserDTO;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class EnsignatService {

    private final EnsignatRepository enseignantRepository;
    private final UserClient userClient;
    @Autowired
    private ModuleRepository moduleRepository;


    @Autowired
    private UnitePedagogiqueRepository unitePedagogiqueRepository;

    public Enseignant addUserAndEnseignant(UserDTO userDTO, Enseignant enseignant) {
        UserDTO createdUser = userClient.createUser(userDTO);

        enseignant.setUserId(createdUser.getId());
        enseignant.setMatricule(createdUser.getMatricule());
        enseignant.setRole("ENSEIGNANT");

        if (enseignant.getUnitePedagogique() != null && enseignant.getUnitePedagogique().getId() != null) {
            UnitePedagogique up = unitePedagogiqueRepository.findById(enseignant.getUnitePedagogique().getId())
                    .orElseThrow(() -> new RuntimeException("Unité pédagogique non trouvée"));
            enseignant.setUnitePedagogique(up);
        } else {
            throw new RuntimeException("Unité pédagogique obligatoire");
        }

        return enseignantRepository.save(enseignant);
    }

    public List<Enseignant> getAllEnseignants() {
        return enseignantRepository.findAllWithModules();
    }


    public Optional<Enseignant> getEnseignantById(Long id) {
        return enseignantRepository.findById(id);
    }

    public List<EnseignantDTO> getAllEnseignantsAvecModule() {
        List<Enseignant> enseignants = enseignantRepository.findAll();

        return enseignants.stream().map(e -> {
            EnseignantDTO dto = new EnseignantDTO();
            dto.setId(e.getId());
            dto.setNom(e.getNom());
            dto.setPrenom(e.getPrenom());
            dto.setEmail(e.getEmail());
            dto.setTelephone(e.getTelephone());
            dto.setMatricule(e.getMatricule());
            dto.setRole(e.getRole());
            dto.setGrade(e.getGrade());

            // Comme il n'y a plus de module, on met une valeur par défaut

            dto.setUnitePedagogiqueLibelle("Unité non assignée");

            return dto;
        }).collect(Collectors.toList());
    }

    public void deleteEnseignant(Long id) {
        if (!enseignantRepository.existsById(id)) {
            throw new RuntimeException("Enseignant avec ID " + id + " non trouvé");
        }
        enseignantRepository.deleteById(id);
    }

    public Enseignant updateEnseignant(Long id, Enseignant updated) {
        Enseignant existing = enseignantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Enseignant non trouvé avec l'ID : " + id));

        existing.setNom(updated.getNom());
        existing.setPrenom(updated.getPrenom());
        existing.setEmail(updated.getEmail());
        existing.setTelephone(updated.getTelephone());
        existing.setMatricule(updated.getMatricule());
        existing.setUnitePedagogique(updated.getUnitePedagogique());
        existing.setRole(updated.getRole());
        existing.setGrade(updated.getGrade());

        // Suppression des traitements sur module

        return enseignantRepository.save(existing);
    }


    public Enseignant affecterModules(Long enseignantId, List<Long> moduleIds) {
        System.out.println("👨‍🏫 ID de l'enseignant = " + enseignantId);
        System.out.println("📦 Modules à affecter = " + moduleIds);

        Enseignant enseignant = enseignantRepository.findById(enseignantId)
                .orElseThrow(() -> new RuntimeException("Enseignant non trouvé"));

        List<MyModule> modules = moduleRepository.findAllById(moduleIds);
        System.out.println("📘 Modules trouvés = " + modules.size());

        enseignant.setModules(modules);
        return enseignantRepository.save(enseignant);
    }


    /**
     * Supprime l'affectation d'un module à un enseignant
     */
    @Transactional
    public boolean supprimerModuleAffecte(Long enseignantId, Long moduleId) {
        Optional<Enseignant> enseignantOpt = enseignantRepository.findById(enseignantId);
        Optional<MyModule> moduleOpt = moduleRepository.findById(moduleId);

        if (enseignantOpt.isEmpty() || moduleOpt.isEmpty()) {
            return false;
        }

        Enseignant enseignant = enseignantOpt.get();

        // forcer le rafraîchissement des modules
        enseignant.getModules().size();

        MyModule module = moduleOpt.get();

        boolean removed = enseignant.getModules().removeIf(m -> m.getId().equals(moduleId));

        if (removed) {
            enseignantRepository.save(enseignant);
            return true;
        } else {
            return false;
        }
    }

}



