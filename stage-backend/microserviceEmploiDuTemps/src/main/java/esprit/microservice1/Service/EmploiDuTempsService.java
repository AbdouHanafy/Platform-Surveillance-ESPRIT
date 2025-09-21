package esprit.microservice1.Service;

import esprit.microservice1.Entity.EmploiDuSurveillance;
import esprit.microservice1.Entity.Enseignant;
import esprit.microservice1.Entity.Groupe;
import esprit.microservice1.Entity.HeuresManquantes;
import esprit.microservice1.Repository.EmploiDuTempsRepository;
import esprit.microservice1.Repository.GroupeRepository;
import esprit.microservice1.Repository.HeuresManquantesRepository;
import esprit.microservice1.Repository.EnsignatRepository;
import esprit.microservice1.ReservationClient;
import esprit.microservice1.ReservationDTO;
import esprit.microservice1.SalleClient;
import esprit.microservice1.SalleDTO;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class EmploiDuTempsService {

    private final EmploiDuTempsRepository emploiRepository;
    private final SalleClient salleClient;
    private final HeuresManquantesRepository heuresManquantesRepository;
    private final ReservationClient reservationClient;
    private final EnsignatRepository enseignantRepository;
private final GroupeRepository groupeRepository;

    private static final int MAX_ENSEIGNANTS_PAR_SALLE = 2;
    private static final float MOYENNE_ANNUELLE = 15f; // moyenne souhaitée

    // --- Calcul des heures surveillées par semestre
    public float calculerHeuresSurveillanceSemestre(Long enseignantId, int annee, int semestre) {
        LocalDate debut;
        LocalDate fin;

        if (semestre == 1) {
            debut = LocalDate.of(annee, 1, 1);
            fin = LocalDate.of(annee, 6, 30);
        } else {
            debut = LocalDate.of(annee, 7, 1);
            fin = LocalDate.of(annee, 12, 31);
        }

        List<EmploiDuSurveillance> surveillances = emploiRepository.findByEnseignantIdAndDateBetween(enseignantId, debut, fin);
        float totalHeures = 0;
        for (EmploiDuSurveillance e : surveillances) {
            totalHeures += Duration.between(e.getHeureDebut(), e.getHeureFin()).toMinutes() / 60f;
        }
        return totalHeures;
    }

    // --- Obtenir le report d'heures manquantes du semestre précédent
    private float getChargeManquantePrecedente(Long enseignantId, int semestre, int annee) {
        int semestrePrecedent = semestre == 1 ? 2 : 1;
        int anneePrecedente = semestre == 1 ? annee - 1 : annee;
        return heuresManquantesRepository.findByEnseignantIdAndSemestreAndAnnee(enseignantId, semestrePrecedent, anneePrecedente)
                .map(HeuresManquantes::getHeuresManquantes)
                .orElse(0f);
    }

    // --- Enregistrer les heures manquantes à reporter
    private void enregistrerHeuresManquantes(Long enseignantId, int semestre, int annee, float heuresManquantes) {
        heuresManquantesRepository.findByEnseignantIdAndSemestreAndAnnee(enseignantId, semestre, annee)
                .ifPresentOrElse(
                        h -> {
                            h.setHeuresManquantes(heuresManquantes);
                            heuresManquantesRepository.save(h);
                        },
                        () -> heuresManquantesRepository.save(
                                HeuresManquantes.builder()
                                        .enseignantId(enseignantId)
                                        .semestre(semestre)
                                        .annee(annee)
                                        .heuresManquantes(heuresManquantes)
                                        .build()
                        )
                );
    }

    // --- Méthode principale pour planifier la surveillance, avec équilibrage
    public EmploiDuSurveillance planifierSurveillance(EmploiDuSurveillance surveillance) {
        if (surveillance.getEnseignant() == null || surveillance.getEnseignant().getId() == null) {
            throw new RuntimeException("L'enseignant doit être renseigné avec un id valide.");
        }

        Long enseignantId = surveillance.getEnseignant().getId();
        Enseignant enseignant = enseignantRepository.findById(enseignantId)
                .orElseThrow(() -> new RuntimeException("Enseignant introuvable avec id : " + enseignantId));
        surveillance.setEnseignant(enseignant);

        verifierSalleExiste(surveillance.getSalleId());

        verifierReservationExistante(surveillance.getSalleId(), surveillance.getDate(), surveillance.getHeureDebut(), surveillance.getHeureFin(), enseignantId);

        int nbAffectes = emploiRepository.countEnseignantsAffectesSallePeriode(
                surveillance.getSalleId(), surveillance.getDate(), surveillance.getHeureDebut(), surveillance.getHeureFin()
        );
        if (nbAffectes >= MAX_ENSEIGNANTS_PAR_SALLE) {
            throw new RuntimeException("Maximum d'enseignants atteint pour cette salle/créneau.");
        }

        int annee = surveillance.getDate().getYear();
        int semestre = surveillance.getSemestre();

        // Heures surveillées ce semestre
        float heuresSurveillanceSemestre = calculerHeuresSurveillanceSemestre(enseignantId, annee, semestre);

        // Report d’heures manquantes du semestre précédent
        float report = getChargeManquantePrecedente(enseignantId, semestre, annee);

        // Heures à ajouter
        float heuresNouvelle = Duration.between(surveillance.getHeureDebut(), surveillance.getHeureFin()).toMinutes() / 60f;

        float totalSemestreAvecReport = heuresSurveillanceSemestre + heuresNouvelle + report;

        float seuilMaxSemestre = MOYENNE_ANNUELLE / 2 * 1.2f; // tolérance 20%, sur semestre (moitié de l'année)

        if (totalSemestreAvecReport > seuilMaxSemestre) {
            throw new RuntimeException("Heures de surveillance planifiées dépassent la moyenne autorisée pour ce semestre (" + seuilMaxSemestre + "h).");
        }

        EmploiDuSurveillance saved = emploiRepository.save(surveillance);

        // Calcul des heures manquantes restantes à la fin du semestre (min 0)
        float heuresManquantes = (MOYENNE_ANNUELLE / 2) - (heuresSurveillanceSemestre + heuresNouvelle);
        if (heuresManquantes < 0) heuresManquantes = 0;

        enregistrerHeuresManquantes(enseignantId, semestre, annee, heuresManquantes);

        return saved;
    }

    // --- Liste des surveillances par enseignant
    public List<EmploiDuSurveillance> getSurveillancesParEnseignant(Long enseignantId) {
        return emploiRepository.findByEnseignantId(enseignantId);
    }

    // --- Récupérer une salle via Feign
    public SalleDTO getSalleParId(Long id) {
        try {
            return salleClient.getById(id);
        } catch (Exception e) {
            throw new RuntimeException("Salle non trouvée avec l'id : " + id);
        }
    }

    // --- Vérifier réservation pour salle/créneau/enseignant
    private void verifierReservationExistante(Long salleId, LocalDate date, LocalTime heureDebut, LocalTime heureFin, Long enseignantId) {
        List<ReservationDTO> reservations = reservationClient.getReservationsBySalle(salleId);
        boolean enseignantAutorise = reservations.stream()
                .anyMatch(r -> r.getEnseignantId().equals(enseignantId));
        if (!enseignantAutorise) {
            throw new RuntimeException("L'enseignant n'a pas de réservation sur cette salle/créneau.");
        }
    }

    // --- Vérifier existence salle via Feign
    private void verifierSalleExiste(Long salleId) {
        try {
            SalleDTO salle = salleClient.getById(salleId);
            if (salle == null) {
                throw new RuntimeException("Salle non trouvée via Feign.");
            }
        } catch (Exception e) {
            throw new RuntimeException("La salle avec ID " + salleId + " n'existe pas.");
        }
    }





    public List<Groupe> getAllGroupes() {
        return groupeRepository.findAll().stream()
                .map(groupe -> new Groupe(
                        groupe.getId(),
                        groupe.getNomClasse(),
                        groupe.getNiveau(),
                        groupe.getOptionGroupe(),
                        groupe.getEffectif(),
                        groupe.getDepartement()

                ))
                .collect(Collectors.toList());
    }

    // Get all emplois du temps
    public List<EmploiDuSurveillance> getAllEmplois() {
        return emploiRepository.findAll();
    }

    // Get emplois by date
    public List<EmploiDuSurveillance> getEmploisByDate(String dateStr) {
        try {
            LocalDate date = LocalDate.parse(dateStr);
            return emploiRepository.findByDate(date);
        } catch (Exception e) {
            throw new RuntimeException("Invalid date format: " + dateStr);
        }
    }

    // Update emploi du temps
    public EmploiDuSurveillance updateEmploi(EmploiDuSurveillance emploi) {
        if (!emploiRepository.existsById(emploi.getId())) {
            throw new RuntimeException("Emploi du temps not found with id: " + emploi.getId());
        }
        return emploiRepository.save(emploi);
    }

}
