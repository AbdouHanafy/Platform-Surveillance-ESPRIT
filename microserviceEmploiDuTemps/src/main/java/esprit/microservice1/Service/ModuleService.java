package esprit.microservice1.Service;


import esprit.microservice1.Entity.Groupe;
import esprit.microservice1.Entity.MyModule;
import esprit.microservice1.Entity.UnitePedagogique;
import esprit.microservice1.Repository.GroupeRepository;
import esprit.microservice1.Repository.ModuleRepository;
import esprit.microservice1.Repository.UnitePedagogiqueRepository;
import lombok.AllArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
public class ModuleService {

    private final ModuleRepository moduleRepository;
private final UnitePedagogiqueRepository unitePedagogiqueRepository;
private final GroupeRepository groupeRepository;

    public List<MyModule> getAllModules() {
        return moduleRepository.findAll();
    }

    // CRUD basique
    public List<MyModule> findAll() {
        return moduleRepository.findAll();
    }

    public Optional<MyModule> findById(Long id) {
        return moduleRepository.findById(id);
    }

    public MyModule save(MyModule module) {
        return moduleRepository.save(module);
    }

    public void delete(Long id) {
        moduleRepository.deleteById(id);
    }

    // Import depuis Excel
    public List<MyModule> importFromExcel(MultipartFile file) throws Exception {
        List<MyModule> modules = new ArrayList<>();

        try (InputStream is = file.getInputStream();
             Workbook workbook = new XSSFWorkbook(is)) {

            Sheet sheet = workbook.getSheetAt(0); // première feuille
            boolean firstRow = true;

            for (Row row : sheet) {
                if (firstRow) {
                    firstRow = false; // sauter l’entête
                    continue;
                }

                // Lecture des cellules
                Cell codeCell = row.getCell(1);
                Cell libelleCell = row.getCell(2);
                Cell uniteIdCell = row.getCell(3);

                if (codeCell == null || libelleCell == null || uniteIdCell == null) {
                    continue; // ligne incomplète, on ignore
                }

                String codeModule = codeCell.getStringCellValue();
                String libelleModule = libelleCell.getStringCellValue();
                long uniteId = (long) uniteIdCell.getNumericCellValue();

                // Chercher l’unité pédagogique
                UnitePedagogique up = unitePedagogiqueRepository.findById(uniteId)
                        .orElseThrow(() -> new RuntimeException("Unité pédagogique non trouvée avec id: " + uniteId));

                // Création du module
                MyModule module = MyModule.builder()
                        .codeModule(codeModule)
                        .libelleModule(libelleModule)
                        .unitePedagogique(up)
                        .build();

                modules.add(module);
            }

            // Sauvegarder tous les modules en base
            return moduleRepository.saveAll(modules);
        }
    }

//////////////////////////////////////////////

    public List<Groupe> findAllGroupes() {
        return groupeRepository.findAll();
    }


    public Optional<Groupe> getGroupeById(Long id) {
        return groupeRepository.findById(id);
    }

    public Groupe createGroupe(Groupe groupe) {
        return groupeRepository.save(groupe);
    }

    public Groupe updateGroupe(Long id, Groupe updatedGroupe) {
        return groupeRepository.findById(id)
                .map(groupe -> {
                    groupe.setNomClasse(updatedGroupe.getNomClasse());
                    groupe.setNiveau(updatedGroupe.getNiveau());
                    groupe.setOptionGroupe(updatedGroupe.getOptionGroupe());
                    groupe.setEffectif(updatedGroupe.getEffectif());
                    groupe.setDepartement(updatedGroupe.getDepartement());
                    return groupeRepository.save(groupe);
                })
                .orElseThrow(() -> new RuntimeException("Groupe not found with ID " + id));
    }

    public void deleteGroupe(Long id) {
        groupeRepository.deleteById(id);
    }

    public boolean existsByNomClasse(String nomClasse) {
        return groupeRepository.existsByNomClasse(nomClasse);
    }

}


