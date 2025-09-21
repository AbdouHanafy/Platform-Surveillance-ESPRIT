package esprit.microservice1.Service;

import esprit.microservice1.Entity.*;
import esprit.microservice1.Repository.EnsignatRepository;
import esprit.microservice1.Repository.EmploiDuTempsRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class AutoAffectationEnseignantService {

    private final EnsignatRepository enseignantRepository;
    private final EmploiDuTempsRepository emploiDuTempsRepository;

    /**
     * Trouve automatiquement le meilleur enseignant pour un module donné
     * Algorithme d'optimisation basé sur:
     * 1. Disponibilité pendant le créneau demandé
     * 2. Spécialisation dans le domaine du module
     * 3. Équilibrage de la charge de travail
     */
    public Optional<Enseignant> findOptimalEnseignant(Long moduleId, String moduleLibelle, 
                                                     LocalDate date, LocalTime heureDebut, 
                                                     LocalTime heureFin) {
        
        // Récupérer tous les enseignants
        List<Enseignant> tousLesEnseignants = enseignantRepository.findAll();
        
        // Filtrer les enseignants disponibles
        List<Enseignant> enseignantsDisponibles = tousLesEnseignants.stream()
                .filter(enseignant -> isEnseignantDisponible(enseignant.getId(), date, heureDebut, heureFin))
                .collect(Collectors.toList());
        
        if (enseignantsDisponibles.isEmpty()) {
            return Optional.empty();
        }
        
        // Prioriser les enseignants spécialisés dans le domaine
        List<Enseignant> enseignantsSpecialises = enseignantsDisponibles.stream()
                .filter(enseignant -> isEnseignantSpecialise(enseignant, moduleLibelle))
                .collect(Collectors.toList());
        
        // Si on a des spécialistes disponibles, les prioriser
        List<Enseignant> candidats = enseignantsSpecialises.isEmpty() ? 
                enseignantsDisponibles : enseignantsSpecialises;
        
        // Choisir l'enseignant avec la charge de travail la plus faible
        return candidats.stream()
                .min((e1, e2) -> {
                    int charge1 = getChargeTravaill(e1.getId(), date);
                    int charge2 = getChargeTravaill(e2.getId(), date);
                    return Integer.compare(charge1, charge2);
                });
    }

    /**
     * Vérifie si un enseignant est disponible pour un créneau donné
     */
    public boolean isEnseignantDisponible(Long enseignantId, LocalDate date, 
                                        LocalTime heureDebut, LocalTime heureFin) {
        
        List<EmploiDuSurveillance> conflits = emploiDuTempsRepository
                .findByEnseignantIdAndDate(enseignantId, date);
        
        return conflits.stream()
                .noneMatch(emploi -> hasTimeConflict(
                    emploi.getHeureDebut(), 
                    emploi.getHeureFin(),
                    heureDebut, heureFin
                ));
    }

    /**
     * Vérifie si un enseignant est spécialisé dans un domaine
     */
    private boolean isEnseignantSpecialise(Enseignant enseignant, String moduleLibelle) {
        // Vérifier par le grade
        if (enseignant.getGrade() != null) {
            String grade = enseignant.getGrade().name().toLowerCase();
            String module = moduleLibelle.toLowerCase();
            
            // Logique de correspondance basée sur les mots-clés
            if (module.contains("informatique") && grade.contains("informatique")) return true;
            if (module.contains("mathematique") && grade.contains("mathematique")) return true;
            if (module.contains("physique") && grade.contains("physique")) return true;
            if (module.contains("chimie") && grade.contains("chimie")) return true;
            if (module.contains("gestion") && grade.contains("gestion")) return true;
        }
        
        // Vérifier par l'unité pédagogique
        if (enseignant.getUnitePedagogique() != null) {
            String uniteLibelle = enseignant.getUnitePedagogique().getLibelle().toLowerCase();
            String module = moduleLibelle.toLowerCase();
            
            return module.contains(uniteLibelle) || uniteLibelle.contains(module);
        }
        
        return false;
    }

    /**
     * Calcule la charge de travail d'un enseignant pour une date donnée
     */
    private int getChargeTravaill(Long enseignantId, LocalDate date) {
        return emploiDuTempsRepository.countByEnseignantIdAndDate(enseignantId, date);
    }

    /**
     * Vérifie s'il y a conflit entre deux créneaux horaires
     */
    private boolean hasTimeConflict(LocalTime debut1, LocalTime fin1, 
                                  LocalTime debut2, LocalTime fin2) {
        return debut1.isBefore(fin2) && fin1.isAfter(debut2);
    }

    /**
     * Effectue une affectation automatique d'enseignant
     */
    public EmploiDuSurveillance affecterEnseignantAutomatiquement(Long moduleId, String moduleLibelle,
                                                                 Long groupeId, Long salleId,
                                                                 LocalDate date, LocalTime heureDebut, 
                                                                 LocalTime heureFin, String typeExamen) {
        
        Optional<Enseignant> enseignantOptimal = findOptimalEnseignant(
            moduleId, moduleLibelle, date, heureDebut, heureFin);
        
        if (enseignantOptimal.isEmpty()) {
            throw new RuntimeException("Aucun enseignant disponible pour les critères demandés");
        }

        // Créer l'emploi du temps de surveillance
        EmploiDuSurveillance emploi = new EmploiDuSurveillance();
        emploi.setEnseignantId(enseignantOptimal.get().getId());
        emploi.setModuleId(moduleId);
        emploi.setGroupeId(groupeId);
        emploi.setSalleId(salleId);
        emploi.setDate(date);
        emploi.setHeureDebut(heureDebut);
        emploi.setHeureFin(heureFin);
        emploi.setTypeActivite(typeExamen != null ? typeExamen : "SURVEILLANCE");
        emploi.setStatut("AFFECTE_AUTO");

        return emploiDuTempsRepository.save(emploi);
    }

    /**
     * Récupère les statistiques d'affectation des enseignants
     */
    public EnseignantAffectationStats getAffectationStats(LocalDate date) {
        List<Enseignant> tousLesEnseignants = enseignantRepository.findAll();
        int totalEnseignants = tousLesEnseignants.size();
        
        long enseignantsMobilises = tousLesEnseignants.stream()
                .filter(enseignant -> emploiDuTempsRepository
                        .countByEnseignantIdAndDate(enseignant.getId(), date) > 0)
                .count();

        long totalAffectations = emploiDuTempsRepository.countByDate(date);
        long affectationsAutomatiques = emploiDuTempsRepository.countByDateAndStatut(date, "AFFECTE_AUTO");

        return new EnseignantAffectationStats(
                totalEnseignants,
                (int) enseignantsMobilises,
                (int) totalAffectations,
                (int) affectationsAutomatiques
        );
    }

    /**
     * Calcule la charge de travail moyenne des enseignants
     */
    public double getChargeTravaildMoyenne(LocalDate date) {
        List<Enseignant> enseignants = enseignantRepository.findAll();
        if (enseignants.isEmpty()) return 0.0;

        double totalCharge = enseignants.stream()
                .mapToInt(e -> getChargeTravaill(e.getId(), date))
                .sum();

        return totalCharge / enseignants.size();
    }

    // Classe interne pour les statistiques
    public static class EnseignantAffectationStats {
        private final int totalEnseignants;
        private final int enseignantsMobilises;
        private final int totalAffectations;
        private final int affectationsAutomatiques;

        public EnseignantAffectationStats(int totalEnseignants, int enseignantsMobilises,
                                        int totalAffectations, int affectationsAutomatiques) {
            this.totalEnseignants = totalEnseignants;
            this.enseignantsMobilises = enseignantsMobilises;
            this.totalAffectations = totalAffectations;
            this.affectationsAutomatiques = affectationsAutomatiques;
        }

        // Getters
        public int getTotalEnseignants() { return totalEnseignants; }
        public int getEnseignantsMobilises() { return enseignantsMobilises; }
        public int getTotalAffectations() { return totalAffectations; }
        public int getAffectationsAutomatiques() { return affectationsAutomatiques; }
        public double getTauxMobilisation() { 
            return totalEnseignants > 0 ? (double) enseignantsMobilises / totalEnseignants * 100 : 0;
        }
    }
}

