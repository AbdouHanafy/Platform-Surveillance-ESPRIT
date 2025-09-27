package esprit.microservice1.Service;


import esprit.microservice1.Entity.*;
import esprit.microservice1.Repository.EnsignatRepository;
import esprit.microservice1.Repository.ExamenChronoRepository;
import esprit.microservice1.Repository.GroupeRepository;
import esprit.microservice1.Repository.ModuleRepository;
import esprit.microservice1.SalleClient;
import esprit.microservice1.SalleDTO;
import esprit.microservice1.SessionClient;
import esprit.microservice1.TeacherSurveillanceDTO;
import esprit.microservice1.SalleReservationDTO;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
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
    private final ExamenValidationService examenValidationService;



    @Transactional
    public synchronized ExamenChrono createExamenChrono(ExamenChronoRequestDTO request) {

        System.out.println("🚀 EXAMEN CHRONO: Creating exam for session " + request.getSessionId() + 
                          ", module " + request.getModuleId() + ", date " + request.getDateExamen() + 
                          ", seance " + request.getSeance());
        System.out.println("🚀 EXAMEN CHRONO: Thread: " + Thread.currentThread().getName() + 
                          ", Time: " + System.currentTimeMillis());

        // -----------------------
        // 🔹 Vérification module et groupe
        // -----------------------
        MyModule module = moduleRepository.findById(request.getModuleId())
                .orElseThrow(() -> new RuntimeException("Module not found"));

        Groupe groupe = groupeRepository.findById(request.getGroupeId())
                .orElseThrow(() -> new RuntimeException("Groupe not found"));

        // -----------------------
        // 🔹 Validation de la date d'examen par rapport à la période de session
        // -----------------------
        System.out.println("🔍 EXAMEN CHRONO: Starting validation for session " + request.getSessionId() + 
                          " and date " + request.getDateExamen());
        
        // Test if validation service is properly injected
        if (examenValidationService == null) {
            System.out.println("❌ EXAMEN CHRONO: Validation service is NULL!");
            throw new RuntimeException("Validation service not properly injected");
        }
        
        System.out.println("✅ EXAMEN CHRONO: Validation service is available, calling validation...");
        
        // Debug: List all sessions to understand what's available
        examenValidationService.debugListAllSessions();
        
        String validationError = examenValidationService.getValidationErrorMessage(request.getSessionId(), request.getModuleId(), request.getDateExamen());
        if (validationError != null) {
            System.out.println("❌ EXAMEN CHRONO: Validation failed - " + validationError);
            throw new RuntimeException(validationError);
        }
        
        System.out.println("✅ EXAMEN CHRONO: Validation passed, proceeding with exam creation");

        // -----------------------
        // 🔹 Récupérer examens déjà planifiés pour ce créneau
        // -----------------------
        List<ExamenChrono> conflicts = chronoRepository.findByDateExamenAndSeance(
                request.getDateExamen(),
                request.getSeance()
        );
        
        // Vérification supplémentaire: s'assurer que nous avons les données les plus récentes
        System.out.println("🔍 CONFLICT CHECK: Refreshing conflicts list...");
        conflicts = chronoRepository.findByDateExamenAndSeance(
                request.getDateExamen(),
                request.getSeance()
        );
        
        // Vérification encore plus stricte: compter tous les examens existants
        long totalExistingExams = chronoRepository.count();
        System.out.println("🔍 CONFLICT CHECK: Total exams in database: " + totalExistingExams);

        System.out.println("🔍 CONFLICT CHECK: Found " + conflicts.size() + " existing exams at " + request.getDateExamen() + " " + request.getSeance());
        
        // Afficher les détails de chaque conflit
        for (int i = 0; i < conflicts.size(); i++) {
            ExamenChrono conflict = conflicts.get(i);
            System.out.println("🔍 CONFLICT " + (i+1) + ": Group=" + conflict.getGroupe().getNomClasse() + 
                             ", Teachers=" + conflict.getEnseignants().stream()
                                     .map(ens -> ens.getNom() + " " + ens.getPrenom())
                                     .collect(Collectors.joining(", ")) +
                             ", Rooms=" + conflict.getSalleIds());
        }

        // -----------------------
        // 🔹 Gestion des enseignants
        // -----------------------
        List<Enseignant> candidats = ensignatRepo.findAll();

        // 1️⃣ Filtrer les enseignants déjà affectés sur ce créneau (éviter les doublons)
        final List<ExamenChrono> finalConflicts = conflicts; // Make conflicts effectively final
        List<Enseignant> enseignantsDispo = candidats.stream()
                .filter(ens -> {
                    boolean isAvailable = finalConflicts.stream()
                        .flatMap(e -> e.getEnseignants().stream())
                            .noneMatch(conflictEns -> conflictEns.getId().equals(ens.getId()));
                    
                    if (!isAvailable) {
                        System.out.println("🔍 TEACHER FILTER: Teacher " + ens.getNom() + " " + ens.getPrenom() + " is already assigned at this time");
                    }
                    
                    return isAvailable;
                })
                .collect(Collectors.toList());
        
        // Double check: ensure no teacher is assigned multiple times at the same time
        Set<Long> enseignantsDejaAssignes = conflicts.stream()
                .flatMap(e -> e.getEnseignants().stream())
                .map(Enseignant::getId)
                .collect(Collectors.toSet());
        
        System.out.println("🔍 TEACHER CHECK: Teachers already assigned at this time: " + 
                          enseignantsDejaAssignes.stream()
                                  .map(id -> candidats.stream()
                                          .filter(ens -> ens.getId().equals(id))
                                          .findFirst()
                                          .map(ens -> ens.getNom() + " " + ens.getPrenom())
                                          .orElse("Unknown"))
                                  .collect(Collectors.joining(", ")));

        System.out.println("🔍 TEACHER CHECK: " + candidats.size() + " total teachers, " + enseignantsDispo.size() + " available");
        
        // Show which teachers are already assigned at this time
        if (conflicts.size() > 0) {
            List<String> assignedTeachers = conflicts.stream()
                    .flatMap(e -> e.getEnseignants().stream())
                    .map(ens -> ens.getNom() + " " + ens.getPrenom())
                    .collect(Collectors.toList());
            System.out.println("🔍 TEACHER CHECK: Teachers already assigned at this time: " + assignedTeachers);
        }
        
        // Afficher la liste des enseignants disponibles
        System.out.println("🔍 TEACHER CHECK: Available teachers for this time slot:");
        for (Enseignant ens : enseignantsDispo) {
            System.out.println("  - " + ens.getNom() + " " + ens.getPrenom() + " (ID: " + ens.getId() + ")");
        }

        if (enseignantsDispo.isEmpty()) {
            System.out.println("❌ TEACHER CHECK: No teachers available - all teachers are already assigned to exams at this time");
            throw new RuntimeException("Aucun enseignant disponible pour cet horaire ! Tous les enseignants sont déjà affectés à des examens à cette heure.");
        }

        // 2️⃣ Calculer charge de chaque enseignant (nombre d'heures de surveillance déjà affectées)
        Map<Enseignant, Long> chargeParEnseignant = enseignantsDispo.stream()
                .collect(Collectors.toMap(
                        ens -> ens,
                        ens -> {
                            // Calculer le nombre total d'heures de surveillance pour cet enseignant
                            List<ExamenChrono> examensEnseignant = chronoRepository.findByEnseignantId(ens.getId());
                            return examensEnseignant.stream()
                                    .mapToLong(examen -> {
                                        // Chaque examen dure 2 heures (8:00-10:00, 10:15-12:15, etc.)
                                        return 2L;
                                    })
                                    .sum();
                        }
                ));

        System.out.println("🔍 TEACHER LOAD: Current teacher surveillance hours:");
        chargeParEnseignant.forEach((teacher, load) -> 
            System.out.println("  - " + teacher.getNom() + " " + teacher.getPrenom() + ": " + load + " hours"));

        // 3️⃣ Trier par moins chargé
        List<Enseignant> sortedEnseignants = chargeParEnseignant.entrySet().stream()
                .sorted(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());

        System.out.println("🔍 TEACHER LOAD: Teachers sorted by surveillance hours (least loaded first):");
        sortedEnseignants.forEach(teacher -> {
            Long load = chargeParEnseignant.get(teacher);
            System.out.println("  - " + teacher.getNom() + " " + teacher.getPrenom() + ": " + load + " hours");
        });

        // 4️⃣ Sélectionner 1 ou 2 selon l'effectif du groupe
        int nbSurveillants = (groupe.getEffectif() > 15) ? 2 : 1;
        
        // Smart selection: try to balance surveillance hours by selecting teachers with least hours
        List<Enseignant> selectedEnseignants = new ArrayList<>();
        int maxHoursPerTeacher = 8; // Maximum surveillance hours per teacher per day (4 exams * 2h each)
        
        for (int i = 0; i < nbSurveillants && i < sortedEnseignants.size(); i++) {
            Enseignant teacher = sortedEnseignants.get(i);
            Long currentHours = chargeParEnseignant.get(teacher);
            
            // Check if teacher is not overloaded in hours
            if (currentHours < maxHoursPerTeacher) {
                selectedEnseignants.add(teacher);
                
                // Update the hours count for this teacher (simulate adding this 2-hour exam)
                chargeParEnseignant.put(teacher, currentHours + 2);
                
                System.out.println("🔍 TEACHER SELECTION: Selected " + teacher.getNom() + " " + teacher.getPrenom() + 
                                 " (hours: " + currentHours + " -> " + chargeParEnseignant.get(teacher) + " hours)");
            } else {
                System.out.println("⚠️ TEACHER SELECTION: Skipping " + teacher.getNom() + " " + teacher.getPrenom() + 
                                 " (overloaded: " + currentHours + " hours, max: " + maxHoursPerTeacher + ")");
            }
        }

        System.out.println("🔍 TEACHER SELECTION: Group size " + groupe.getEffectif() + " requires " + nbSurveillants + " supervisor(s)");
        System.out.println("🔍 TEACHER SELECTION: Final selection: " + 
                          selectedEnseignants.stream().map(e -> e.getNom() + " " + e.getPrenom()).collect(Collectors.joining(", ")));

        // Final check: ensure no teacher is assigned multiple times
        Set<Long> selectedTeacherIds = selectedEnseignants.stream()
                .map(Enseignant::getId)
                .collect(Collectors.toSet());
        
        if (selectedTeacherIds.size() != selectedEnseignants.size()) {
            System.err.println("❌ TEACHER SELECTION ERROR: Duplicate teachers detected in selection!");
            throw new RuntimeException("Erreur: Des enseignants dupliqués ont été détectés dans la sélection!");
        }
        
        // Check if any selected teacher is already assigned at this time
        boolean hasConflict = selectedEnseignants.stream()
                .anyMatch(teacher -> enseignantsDejaAssignes.contains(teacher.getId()));
        
        if (hasConflict) {
            System.err.println("❌ TEACHER SELECTION ERROR: Selected teachers are already assigned at this time!");
            System.err.println("❌ TEACHER SELECTION ERROR: Selected teachers: " + selectedEnseignants.stream()
                    .map(ens -> ens.getNom() + " " + ens.getPrenom() + " (ID: " + ens.getId() + ")")
                    .collect(Collectors.joining(", ")));
            System.err.println("❌ TEACHER SELECTION ERROR: Already assigned teacher IDs: " + enseignantsDejaAssignes);
            throw new RuntimeException("Erreur: Certains enseignants sélectionnés sont déjà affectés à cette heure!");
        }
        
        System.out.println("✅ TEACHER SELECTION: All selected teachers are available and not duplicated");

        if (selectedEnseignants.isEmpty()) {
            throw new RuntimeException("Aucun enseignant disponible après équilibrage !");
        }

        // -----------------------
// 🔹 Gestion des salles
// -----------------------
        List<Long> toutesSalles = salleClient.getAvailableSalleIds(); // méthode existante
        List<Long> sallesFinales = new ArrayList<>();

        System.out.println("🔍 ROOM CHECK: Total available rooms: " + toutesSalles.size());
        System.out.println("🔍 ROOM CHECK: Available room IDs: " + toutesSalles);

// Nombre de salles nécessaires selon l'effectif
        int nbSallesNecessaires = (groupe.getEffectif() > 15) ? 2 : 1;
        System.out.println("🔍 ROOM CHECK: Rooms needed for group size " + groupe.getEffectif() + ": " + nbSallesNecessaires);

        // Get all rooms that are already occupied at this time (PARTAGE COMPLET)
        List<Long> sallesOccupees = conflicts.stream()
                .flatMap(e -> e.getSalleIds().stream())
                .distinct() // Éviter les doublons
                .collect(Collectors.toList());
        
        System.out.println("🔍 ROOM FILTER: Detailed room conflict analysis:");
        for (ExamenChrono conflict : conflicts) {
            System.out.println("  - Group: " + conflict.getGroupe().getNomClasse() + 
                             ", Rooms: " + conflict.getSalleIds());
        }
        
        System.out.println("🔍 ROOM CHECK: Rooms already occupied at this time: " + sallesOccupees);
        
        // Vérification stricte: aucune salle ne peut être réutilisée au même moment
        if (!sallesOccupees.isEmpty()) {
            System.out.println("⚠️ ROOM CHECK: " + sallesOccupees.size() + " room(s) already in use at this time - will be excluded");
        }
        
        // Also check for rooms that are permanently reserved (estReservee = true)
        List<Long> sallesReservees = salleClient.getAvailableSalleIds().stream()
                .filter(salleId -> {
                    // This will be handled by the salleClient.getAvailableSalleIds() method
                    // which should only return non-reserved rooms
                    return false; // Placeholder - actual logic in salleClient
                })
                .collect(Collectors.toList());
        
        System.out.println("🔍 ROOM CHECK: Permanently reserved rooms: " + sallesReservees);
        
        // Show which groups are using which rooms at this time
        if (conflicts.size() > 0) {
            System.out.println("🔍 ROOM CHECK: Existing exam assignments at this time:");
            for (ExamenChrono conflict : conflicts) {
                System.out.println("  - Group: " + conflict.getGroupe().getNomClasse() + 
                                 ", Module: " + conflict.getModule().getLibelleModule() + 
                                 ", Rooms: " + conflict.getSalleIds());
            }
        }
        
        // Afficher toutes les salles disponibles
        System.out.println("🔍 ROOM CHECK: All available rooms: " + toutesSalles);
        System.out.println("🔍 ROOM CHECK: Rooms already occupied: " + sallesOccupees);

        // Boucle pour choisir les salles libres (PARTAGE COMPLET - aucune réutilisation)
        for (Long salleId : toutesSalles) {
            // Check if this room is already used in any existing exam at the same time
            boolean estOccupee = sallesOccupees.contains(salleId);
            
            // Check if this room is already selected for this exam (avoid duplicates within same exam)
            boolean dejaSelectionnee = sallesFinales.contains(salleId);

            System.out.println("🔍 ROOM CHECK: Checking room " + salleId + " - occupied: " + estOccupee + ", already selected: " + dejaSelectionnee);

            // PARTAGE COMPLET: Seules les salles complètement libres sont acceptées
            if (!estOccupee && !dejaSelectionnee) {
                sallesFinales.add(salleId);
                System.out.println("✅ ROOM CHECK: Room " + salleId + " is completely free - added to selection");
                
                // NE PAS ajouter à sallesOccupees ici - cela cause un conflit avec la vérification finale
            } else {
                if (estOccupee) {
                    System.out.println("❌ ROOM CHECK: Room " + salleId + " is occupied at this time - PARTAGE COMPLET: skipping");
                }
                if (dejaSelectionnee) {
                    System.out.println("❌ ROOM CHECK: Room " + salleId + " already selected for this exam - skipping");
                }
            }

            if (sallesFinales.size() >= nbSallesNecessaires) {
                System.out.println("🔍 ROOM CHECK: Found enough rooms (" + sallesFinales.size() + "), stopping search");
                break; // on a assez de salles
            }
        }

        System.out.println("🔍 ROOM CHECK: Found " + sallesFinales.size() + " available rooms, need " + nbSallesNecessaires);
        System.out.println("🔍 ROOM CHECK: Final room assignment: " + sallesFinales);

        // Vérification finale: s'assurer qu'aucune salle n'est dupliquée dans la sélection
        Set<Long> sallesFinalesSet = new HashSet<>(sallesFinales);
        if (sallesFinalesSet.size() != sallesFinales.size()) {
            System.err.println("❌ ROOM CHECK ERROR: Duplicate rooms detected in final assignment!");
            throw new RuntimeException("Erreur: Des salles dupliquées ont été détectées dans l'affectation finale!");
        }
        
        System.out.println("✅ ROOM CHECK: All selected rooms are available and not duplicated");

        if (sallesFinales.size() < nbSallesNecessaires) {
            System.out.println("❌ ROOM CHECK: Not enough rooms available");
            String errorMsg = "Pas assez de salles disponibles pour cet horaire ! " + 
                            "Disponibles: " + sallesFinales.size() + ", Nécessaires: " + nbSallesNecessaires + 
                            ". Salles occupées: " + sallesOccupees;
            throw new RuntimeException(errorMsg);
        }


        // -----------------------
        // 🔹 Vérification finale AVANT création
        // -----------------------
        System.out.println("🔍 FINAL CHECK: Verifying no conflicts before saving...");
        
        // Vérification finale des enseignants - TRÈS STRICTE
        System.out.println("🔍 FINAL TEACHER CHECK: Checking " + selectedEnseignants.size() + " selected teachers...");
        for (Enseignant teacher : selectedEnseignants) {
            System.out.println("🔍 FINAL TEACHER CHECK: Checking teacher " + teacher.getNom() + " " + teacher.getPrenom() + " (ID: " + teacher.getId() + ")");
            
            // Récupérer TOUS les examens à cette date/heure
            List<ExamenChrono> allExamsAtTime = chronoRepository.findByDateExamenAndSeance(
                    request.getDateExamen(), request.getSeance());
            
            System.out.println("🔍 FINAL TEACHER CHECK: Found " + allExamsAtTime.size() + " total exams at this time");
            
            // Vérifier si ce professeur est déjà assigné
            List<ExamenChrono> teacherConflicts = allExamsAtTime.stream()
                    .filter(exam -> exam.getEnseignants().stream()
                            .anyMatch(ens -> ens.getId().equals(teacher.getId())))
                    .collect(Collectors.toList());
            
            System.out.println("🔍 FINAL TEACHER CHECK: Teacher " + teacher.getNom() + " " + teacher.getPrenom() + 
                             " has " + teacherConflicts.size() + " existing assignments at this time");
            
            if (!teacherConflicts.isEmpty()) {
                System.err.println("❌ FINAL CHECK: Teacher " + teacher.getNom() + " " + teacher.getPrenom() + 
                                 " is already assigned to " + teacherConflicts.size() + " exam(s) at this time!");
                for (ExamenChrono conflict : teacherConflicts) {
                    System.err.println("  - Conflict: Group " + conflict.getGroupe().getNomClasse() + 
                                     ", Module " + conflict.getModule().getLibelleModule());
                }
                throw new RuntimeException("Erreur: L'enseignant " + teacher.getNom() + " " + teacher.getPrenom() + 
                                         " est déjà affecté à un examen à cette heure!");
            }
        }
        
        // Vérification finale des salles - TRÈS STRICTE
        System.out.println("🔍 FINAL ROOM CHECK: Checking " + sallesFinales.size() + " selected rooms...");
        for (Long salleId : sallesFinales) {
            System.out.println("🔍 FINAL ROOM CHECK: Checking room " + salleId);
            
            // Récupérer TOUS les examens à cette date/heure
            List<ExamenChrono> allExamsAtTime = chronoRepository.findByDateExamenAndSeance(
                    request.getDateExamen(), request.getSeance());
            
            System.out.println("🔍 FINAL ROOM CHECK: Found " + allExamsAtTime.size() + " total exams at this time");
            
            // Vérifier si cette salle est déjà occupée
            List<ExamenChrono> roomConflicts = allExamsAtTime.stream()
                    .filter(exam -> exam.getSalleIds().contains(salleId))
                    .collect(Collectors.toList());
            
            System.out.println("🔍 FINAL ROOM CHECK: Room " + salleId + 
                             " has " + roomConflicts.size() + " existing assignments at this time");
            
            if (!roomConflicts.isEmpty()) {
                System.err.println("❌ FINAL CHECK: Room " + salleId + 
                                 " is already assigned to " + roomConflicts.size() + " exam(s) at this time!");
                for (ExamenChrono conflict : roomConflicts) {
                    System.err.println("  - Conflict: Group " + conflict.getGroupe().getNomClasse() + 
                                     ", Module " + conflict.getModule().getLibelleModule() + 
                                     ", Rooms " + conflict.getSalleIds());
                }
                throw new RuntimeException("Erreur: La salle " + salleId + 
                                         " est déjà affectée à un examen à cette heure!");
            }
        }
        
        System.out.println("✅ FINAL CHECK: No conflicts detected, proceeding with exam creation");

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
        
        System.out.println("✅ EXAMEN CREATED: Exam created successfully!");
        System.out.println("✅ EXAMEN CREATED: Group: " + groupe.getNomClasse());
        System.out.println("✅ EXAMEN CREATED: Module: " + module.getLibelleModule());
        System.out.println("✅ EXAMEN CREATED: Date: " + request.getDateExamen() + " " + request.getSeance());
        System.out.println("✅ EXAMEN CREATED: Rooms: " + sallesFinales);
        System.out.println("✅ EXAMEN CREATED: Teachers: " + selectedEnseignants.stream()
                .map(ens -> ens.getNom() + " " + ens.getPrenom())
                .collect(Collectors.joining(", ")));
        
        // Afficher le tableau des heures de surveillance après chaque création
        afficherTableauSurveillance();
        
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

    /**
     * 📊 Affiche le tableau des heures de surveillance par enseignant
     * Équilibrage complet des heures entre tous les enseignants
     */
    public void afficherTableauSurveillance() {
        System.out.println("\n" + "=".repeat(80));
        System.out.println("📊 TABLEAU DES HEURES DE SURVEILLANCE PAR ENSEIGNANT");
        System.out.println("=".repeat(80));
        
        List<Enseignant> tousEnseignants = ensignatRepo.findAll();
        
        if (tousEnseignants.isEmpty()) {
            System.out.println("❌ Aucun enseignant trouvé dans la base de données");
            return;
        }
        
        // Calculer les heures de surveillance pour chaque enseignant
        Map<Enseignant, Long> heuresParEnseignant = tousEnseignants.stream()
                .collect(Collectors.toMap(
                        ens -> ens,
                        ens -> {
                            List<ExamenChrono> examens = chronoRepository.findByEnseignantId(ens.getId());
                            return examens.stream()
                                    .mapToLong(examen -> 2L) // Chaque examen = 2h
                                    .sum();
                        }
                ));
        
        // Trier par nombre d'heures (du moins chargé au plus chargé)
        List<Map.Entry<Enseignant, Long>> enseignantsTries = heuresParEnseignant.entrySet().stream()
                .sorted(Map.Entry.comparingByValue())
                .collect(Collectors.toList());
        
        // Afficher le tableau
        System.out.printf("%-20s | %-15s | %-10s | %-15s%n", "ENSEIGNANT", "HEURES", "EXAMENS", "STATUT");
        System.out.println("-".repeat(80));
        
        long totalHeures = 0;
        long totalExamens = 0;
        
        for (Map.Entry<Enseignant, Long> entry : enseignantsTries) {
            Enseignant enseignant = entry.getKey();
            Long heures = entry.getValue();
            Long nbExamens = heures / 2; // 2h par examen
            
            String statut;
            if (heures == 0) {
                statut = "🟢 LIBRE";
            } else if (heures <= 4) {
                statut = "🟡 LÉGER";
            } else if (heures <= 8) {
                statut = "🟠 NORMAL";
            } else {
                statut = "🔴 SURCHARGÉ";
            }
            
            System.out.printf("%-20s | %-15d | %-10d | %-15s%n", 
                    enseignant.getNom() + " " + enseignant.getPrenom(), 
                    heures, 
                    nbExamens, 
                    statut);
            
            totalHeures += heures;
            totalExamens += nbExamens;
        }
        
        System.out.println("-".repeat(80));
        System.out.printf("%-20s | %-15d | %-10d | %-15s%n", 
                "TOTAL", totalHeures, totalExamens, "ÉQUILIBRAGE");
        
        // Calculer l'équilibrage
        if (!tousEnseignants.isEmpty()) {
            double moyenneHeures = (double) totalHeures / tousEnseignants.size();
            System.out.println("\n📈 STATISTIQUES D'ÉQUILIBRAGE:");
            System.out.println("   • Nombre d'enseignants: " + tousEnseignants.size());
            System.out.println("   • Heures totales: " + totalHeures + "h");
            System.out.println("   • Moyenne par enseignant: " + String.format("%.1f", moyenneHeures) + "h");
            
            // Vérifier l'équilibrage
            long minHeures = heuresParEnseignant.values().stream().mapToLong(Long::longValue).min().orElse(0);
            long maxHeures = heuresParEnseignant.values().stream().mapToLong(Long::longValue).max().orElse(0);
            long ecart = maxHeures - minHeures;
            
            System.out.println("   • Écart min-max: " + ecart + "h");
            if (ecart <= 2) {
                System.out.println("   • Statut: ✅ ÉQUILIBRÉ");
            } else if (ecart <= 4) {
                System.out.println("   • Statut: ⚠️ PARTIELLEMENT ÉQUILIBRÉ");
            } else {
                System.out.println("   • Statut: ❌ DÉSÉQUILIBRÉ");
            }
        }
        
        System.out.println("=".repeat(80) + "\n");
    }

    public void debugListAllSessions() {
        examenValidationService.debugListAllSessions();
    }

    /**
     * 📊 Récupère les heures de surveillance par enseignant pour le frontend
     */
    public List<TeacherSurveillanceDTO> getTeacherSurveillanceHours() {
        List<Enseignant> tousEnseignants = ensignatRepo.findAll();
        System.out.println("🔍 DEBUG: Found " + tousEnseignants.size() + " teachers total");
        
        // Debug: Vérifier tous les examens
        List<ExamenChrono> tousExamens = chronoRepository.findAll();
        System.out.println("🔍 DEBUG: Found " + tousExamens.size() + " exams total");
        
        for (ExamenChrono exam : tousExamens) {
            System.out.println("🔍 DEBUG: Exam " + exam.getId() + " has " + 
                             (exam.getEnseignants() != null ? exam.getEnseignants().size() : 0) + " teachers");
            if (exam.getEnseignants() != null) {
                for (Enseignant ens : exam.getEnseignants()) {
                    System.out.println("  - Teacher: " + ens.getNom() + " " + ens.getPrenom() + " (ID: " + ens.getId() + ")");
                }
            }
        }
        
        return tousEnseignants.stream()
                .map(enseignant -> {
                    List<ExamenChrono> examens = chronoRepository.findByEnseignantId(enseignant.getId());
                    System.out.println("🔍 DEBUG: Teacher " + enseignant.getNom() + " " + enseignant.getPrenom() + 
                                     " (ID: " + enseignant.getId() + ") has " + examens.size() + " exams");
                    
                    Long heures = examens.stream()
                            .mapToLong(examen -> 2L) // Chaque examen = 2h
                            .sum();
                    Long nbExamens = heures / 2;
                    
                    String statut;
                    String couleurStatut;
                    if (heures == 0) {
                        statut = "LIBRE";
                        couleurStatut = "🟢";
                    } else if (heures <= 4) {
                        statut = "LÉGER";
                        couleurStatut = "🟡";
                    } else if (heures <= 8) {
                        statut = "NORMAL";
                        couleurStatut = "🟠";
                    } else {
                        statut = "SURCHARGÉ";
                        couleurStatut = "🔴";
                    }
                    
                    return new TeacherSurveillanceDTO(
                            enseignant.getId(),
                            enseignant.getNom(),
                            enseignant.getPrenom(),
                            heures,
                            nbExamens,
                            statut,
                            couleurStatut
                    );
                })
                .sorted((t1, t2) -> Long.compare(t1.getSurveillanceHours(), t2.getSurveillanceHours()))
                .collect(Collectors.toList());
    }

    /**
     * 📊 Récupère les réservations d'examens pour une salle spécifique
     */
    public List<SalleReservationDTO> getReservationsBySalleId(Long salleId) {
        System.out.println("🔍 DEBUG: Getting reservations for salle ID: " + salleId);
        
        // Récupérer tous les examens qui utilisent cette salle
        List<ExamenChrono> examens = chronoRepository.findAll().stream()
                .filter(examen -> examen.getSalleIds() != null && examen.getSalleIds().contains(salleId))
                .collect(Collectors.toList());
        
        System.out.println("🔍 DEBUG: Found " + examens.size() + " exams for salle " + salleId);
        
        return examens.stream()
                .map(examen -> {
                    // Récupérer le premier enseignant (pour simplifier)
                    String enseignantNom = "N/A";
                    String enseignantPrenom = "N/A";
                    if (examen.getEnseignants() != null && !examen.getEnseignants().isEmpty()) {
                        Enseignant premierEnseignant = examen.getEnseignants().get(0);
                        enseignantNom = premierEnseignant.getNom();
                        enseignantPrenom = premierEnseignant.getPrenom() != null ? premierEnseignant.getPrenom() : "";
                    }
                    
                    return new SalleReservationDTO(
                            examen.getId(),
                            examen.getModule() != null ? examen.getModule().getLibelleModule() : "N/A",
                            examen.getGroupe() != null ? examen.getGroupe().getNomClasse() : "N/A",
                            examen.getDateExamen(),
                            examen.getSeance(),
                            enseignantNom,
                            enseignantPrenom,
                            "RÉSERVÉ"
                    );
                })
                .collect(Collectors.toList());
    }

}
