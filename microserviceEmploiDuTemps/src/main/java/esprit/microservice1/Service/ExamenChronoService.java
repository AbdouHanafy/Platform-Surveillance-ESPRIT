package esprit.microservice1.Service;


import esprit.microservice1.Entity.*;
import esprit.microservice1.Repository.EnsignatRepository;
import esprit.microservice1.Repository.ExamenChronoRepository;
import esprit.microservice1.Repository.GroupeRepository;
import esprit.microservice1.Repository.ModuleRepository;
import esprit.microservice1.SalleClient;
import esprit.microservice1.SalleDTO;
import esprit.microservice1.SessionClient;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class ExamenChronoService {

    private final ExamenChronoRepository chronoRepository;
    private final EnsignatRepository ensignatRepo;
    private final SessionClient sessionClient;
    private final ModuleRepository moduleRepository;
    private final GroupeRepository groupeRepository;
    private final SalleClient salleClient;
    private final NotificationService notificationService;



    @Transactional
    public ExamenChrono createExamenChrono(ExamenChronoRequestDTO request) {

        // -----------------------
        // 🔹 Vérification module et groupe
        // -----------------------
        MyModule module = moduleRepository.findById(request.getModuleId())
                .orElseThrow(() -> new RuntimeException("Module not found"));

        Groupe groupe = groupeRepository.findById(request.getGroupeId())
                .orElseThrow(() -> new RuntimeException("Groupe not found"));

        // -----------------------
        // 🔹 Récupérer examens déjà planifiés pour ce créneau
        // -----------------------
        List<ExamenChrono> conflicts = chronoRepository.findByDateExamenAndSeance(
                request.getDateExamen(),
                request.getSeance()
        );

        // -----------------------
        // 🔹 Gestion des enseignants
        // -----------------------
        List<Enseignant> candidats = ensignatRepo.findAll();

        // 1️⃣ Filtrer les enseignants déjà affectés sur ce créneau
        List<Enseignant> enseignantsDispo = candidats.stream()
                .filter(ens -> conflicts.stream()
                        .flatMap(e -> e.getEnseignants().stream())
                        .noneMatch(conflictEns -> conflictEns.getId().equals(ens.getId())))
                .collect(Collectors.toList());

        if (enseignantsDispo.isEmpty()) {
            throw new RuntimeException("Aucun enseignant disponible pour cet horaire !");
        }

        // 2️⃣ Calculer charge de chaque enseignant (nombre d'examens déjà affectés)
        Map<Enseignant, Long> chargeParEnseignant = enseignantsDispo.stream()
                .collect(Collectors.toMap(
                        ens -> ens,
                        ens -> Long.valueOf(chronoRepository.findByEnseignantId(ens.getId()).size())
                ));

        // 3️⃣ Trier par moins chargé
        List<Enseignant> sortedEnseignants = chargeParEnseignant.entrySet().stream()
                .sorted(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());

        // 4️⃣ Sélectionner 1 ou 2 selon l’effectif du groupe
        int nbSurveillants = (groupe.getEffectif() > 15) ? 2 : 1;
        List<Enseignant> selectedEnseignants = sortedEnseignants.stream()
                .limit(nbSurveillants)
                .collect(Collectors.toList());

        if (selectedEnseignants.isEmpty()) {
            throw new RuntimeException("Aucun enseignant disponible après équilibrage !");
        }

        // -----------------------
// 🔹 Gestion des salles
// -----------------------
        List<Long> toutesSalles = salleClient.getAvailableSalleIds(); // méthode existante
        List<Long> sallesFinales = new ArrayList<>();

// Nombre de salles nécessaires selon l'effectif
        int nbSallesNecessaires = (groupe.getEffectif() > 15) ? 2 : 1;

// Boucle pour choisir les salles libres
        for (Long salleId : toutesSalles) {
            boolean estOccupee = conflicts.stream()
                    .flatMap(e -> e.getSalleIds().stream())
                    .anyMatch(id -> id.equals(salleId));

            if (!estOccupee) {
                sallesFinales.add(salleId);
            }

            if (sallesFinales.size() >= nbSallesNecessaires) {
                break; // on a assez de salles
            }
        }

        if (sallesFinales.size() < nbSallesNecessaires) {
            throw new RuntimeException("Pas assez de salles disponibles pour cet horaire !");
        }


        // -----------------------
        // 🔹 Création de l'examen
        // -----------------------
        ExamenChrono examen = ExamenChrono.builder()
                .sessionId(request.getSessionId())
                .periode(request.getPeriode())
                .module(module)
                .groupe(groupe)
                .dateExamen(request.getDateExamen())
                .seance(request.getSeance())
                .enseignants(selectedEnseignants)
                .salleIds(sallesFinales)
                .build();

        ExamenChrono saved = chronoRepository.save(examen);
        conflicts.add(saved);
        // -----------------------
        // 🔹 Notification enseignants
        // -----------------------
        for (Enseignant ens : selectedEnseignants) {
            notificationService.notifyEnseignant(
                    ens.getId(),
                    "Examen de " + module.getLibelleModule() +
                            " avec le groupe " + groupe.getNomClasse() +
                            " le " + request.getDateExamen() +
                            " (séance: " + request.getSeance() + ")"
            );
        }

        return saved;

    }




    public List<ExamenChrono> getAllChronos() {
        return chronoRepository.findAll();
    }

    public ExamenChrono getById(Long id) {
        return chronoRepository.findById(id).orElse(null);
    }

}
