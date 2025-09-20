package esprit.microservicegestiondessalles.Service;


import esprit.microservicegestiondessalles.*;
import esprit.microservicegestiondessalles.Entity.EmploiDuTemps;
import esprit.microservicegestiondessalles.Entity.ReservationSalle;
import esprit.microservicegestiondessalles.Entity.Salle;
import esprit.microservicegestiondessalles.Repository.EmploiDuTempsRepository;
import esprit.microservicegestiondessalles.Repository.ReservationSalleRepository;
import esprit.microservicegestiondessalles.Repository.SalleRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class EmploiDuTempsService {

    private final EmploiDuTempsRepository emploiDuTempsRepository;
    private final EnseignantClient enseignantClient; // Feign client vers microservice enseignant
    private final GroupeClient groupeClient;
    private ReservationSalleRepository reservationSalleRepository;
    private SalleRepository salleRepository;


    public EmploiDuTemps create(EmploiDuTemps emploiDuTemps) {

        // 1. Vérifier enseignant
        EnseignantDTO enseignant = enseignantClient.getEnseignantById(emploiDuTemps.getEnseignantId());
        if (enseignant == null) throw new RuntimeException("Enseignant introuvable");

        // 2. Vérifier groupe
        if (emploiDuTemps.getGroupeId() != null) {
            GroupeDTO groupe = groupeClient.getGroupeById(emploiDuTemps.getGroupeId());
            if (groupe == null) throw new RuntimeException("Groupe introuvable");
        }

        // 3. Validation horaires
        if (emploiDuTemps.getHeureDebut() == null || emploiDuTemps.getHeureFin() == null)
            throw new RuntimeException("Heure début/fin requises");
        if (!emploiDuTemps.getHeureFin().isAfter(emploiDuTemps.getHeureDebut()))
            throw new RuntimeException("Heure fin doit être après heure début");

        // 4. Conflits enseignant
        List<EmploiDuTemps> conflitsEns = emploiDuTempsRepository.findByEnseignantIdAndDate(emploiDuTemps.getEnseignantId(), emploiDuTemps.getDate())
                .stream()
                .filter(e -> emploiDuTemps.getHeureDebut().isBefore(e.getHeureFin()) && emploiDuTemps.getHeureFin().isAfter(e.getHeureDebut()))
                .collect(Collectors.toList());

        if (!conflitsEns.isEmpty()) throw new RuntimeException("Conflit avec un autre emploi du temps enseignant");

        // 5. Conflits salle — on vérifie dans emploiDuTempsRepository, par nom de salle et date
        if (emploiDuTemps.getSalle() != null && !emploiDuTemps.getSalle().isEmpty()) {
            List<EmploiDuTemps> conflitsSalle = emploiDuTempsRepository.findBySalleAndDate(emploiDuTemps.getSalle(), emploiDuTemps.getDate())
                    .stream()
                    .filter(e -> emploiDuTemps.getHeureDebut().isBefore(e.getHeureFin()) && emploiDuTemps.getHeureFin().isAfter(e.getHeureDebut()))
                    .collect(Collectors.toList());

            if (!conflitsSalle.isEmpty()) throw new RuntimeException("Salle déjà réservée sur ce créneau");
        }

        // 6. Sauvegarder l'emploi du temps
        return emploiDuTempsRepository.save(emploiDuTemps);
    }



    public List<EmploiDuTemps> getByEnseignantId(Long enseignantId) {
        return emploiDuTempsRepository.findByEnseignantId(enseignantId);
    }




    public List<EmploiDuTempsDetailDTO> getDetailsByEnseignant(Long enseignantId) {
        List<EmploiDuTemps> emplois = emploiDuTempsRepository.findByEnseignantId(enseignantId);

        return emplois.stream().map(e -> {
            GroupeDTO groupe = groupeClient.getGroupeById(e.getGroupeId());
            return new EmploiDuTempsDetailDTO(e, groupe);
        }).collect(Collectors.toList());
    }


    public List<GroupeDTO> getAllGroupes() {
        return groupeClient.getAllGroupes();
    }



    public List<EmploiDuTemps> getEmploisFiltres(Long enseignantId, Long groupeId, String dateStr) {
        LocalDate date = null;
        if (dateStr != null && !dateStr.isEmpty()) {
            date = LocalDate.parse(dateStr);
        }

        // Variables finales pour la lambda
        final Long finalEnseignantId = enseignantId;
        final Long finalGroupeId = groupeId;
        final LocalDate finalDate = date;

        return emploiDuTempsRepository.findAll().stream()
                .filter(e -> finalEnseignantId == null || e.getEnseignantId().equals(finalEnseignantId))
                .filter(e -> finalGroupeId == null || e.getGroupeId().equals(finalGroupeId))
                .filter(e -> finalDate == null || e.getDate().equals(finalDate))
                .collect(Collectors.toList());
    }
    public List<EmploiDuTemps> getBySalleNom(String salleNom) {
        return emploiDuTempsRepository.findBySalle(salleNom);
    }

}
