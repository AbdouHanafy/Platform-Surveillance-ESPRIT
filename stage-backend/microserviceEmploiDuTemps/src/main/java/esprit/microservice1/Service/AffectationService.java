package esprit.microservice1.Service;


import esprit.microservice1.Entity.AffectationModuleGroupe;
import esprit.microservice1.Entity.Groupe;
import esprit.microservice1.Entity.MyModule;
import esprit.microservice1.Entity.Periode;
import esprit.microservice1.Repository.AffectationModuleGroupeRepository;
import esprit.microservice1.Repository.GroupeRepository;
import esprit.microservice1.Repository.ModuleRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class AffectationService {

    private final AffectationModuleGroupeRepository affectationRepository;
    private final GroupeRepository groupeRepository;
    private final ModuleRepository moduleRepository;

    // ✅ Affecter un module à plusieurs groupes pour une période
    public void affecterModuleAGroupes(Long moduleId, List<Long> groupeIds, Periode periode) {
        MyModule module = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new RuntimeException("Module non trouvé"));

        for (Long groupeId : groupeIds) {
            Groupe groupe = groupeRepository.findById(groupeId)
                    .orElseThrow(() -> new RuntimeException("Groupe non trouvé"));

            AffectationModuleGroupe affectation = AffectationModuleGroupe.builder()
                    .module(module)
                    .groupe(groupe)
                    .periode(periode)
                    .build();

            affectationRepository.save(affectation);
        }
    }

    // ✅ Liste des affectations
    public List<AffectationModuleGroupe> getAllAffectations() {
        return affectationRepository.findAll();
    }

    // ✅ Supprimer une affectation
    public void deleteAffectation(Long id) {
        affectationRepository.deleteById(id);
    }


    public List<MyModule> getModulesByPeriode(Periode periode) {
        return affectationRepository.findByPeriode(periode).stream()
                .map(AffectationModuleGroupe::getModule)
                .distinct()
                .collect(Collectors.toList());
    }


    public List<Groupe> getGroupesByModuleAndPeriode(Long moduleId, Periode periode) {
        return affectationRepository.findByModuleIdAndPeriode(moduleId, periode).stream()
                .map(AffectationModuleGroupe::getGroupe)
                .collect(Collectors.toList());
    }
}
