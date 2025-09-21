package esprit.microservice1.Service;

import esprit.microservice1.Entity.EmploiDuSurveillance;
import esprit.microservice1.Entity.Enseignant;
import esprit.microservice1.Repository.EmploiDuTempsRepository;
import esprit.microservice1.Repository.EnsignatRepository;
import lombok.AllArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@AllArgsConstructor
public class PDFGenerationService {

    private final EmploiDuTempsRepository emploiDuTempsRepository;
    private final EnsignatRepository enseignantRepository;

    public ResponseEntity<ByteArrayResource> generateEnseignantPlanningPDF(Long enseignantId, LocalDate date) throws IOException {
        // Récupérer l'enseignant
        Enseignant enseignant = enseignantRepository.findById(enseignantId)
                .orElseThrow(() -> new RuntimeException("Enseignant non trouvé"));

        // Récupérer les emplois du temps de l'enseignant pour la date donnée
        List<EmploiDuSurveillance> plannings = emploiDuTempsRepository.findByEnseignantIdAndDate(enseignantId, date);

        // Générer le contenu PDF
        String pdfContent = generateEnseignantPlanningContent(enseignant, plannings, date);
        
        // Convertir en bytes (simulation - vous devrez utiliser une vraie librairie PDF)
        byte[] pdfBytes = pdfContent.getBytes();

        // Créer la ressource
        ByteArrayResource resource = new ByteArrayResource(pdfBytes);

        // Préparer la réponse
        String filename = String.format("planning_enseignant_%s_%s.pdf", 
                enseignant.getNom(), date.format(DateTimeFormatter.ISO_LOCAL_DATE));

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .contentLength(pdfBytes.length)
                .body(resource);
    }

    public ResponseEntity<ByteArrayResource> generateDailyPlanningPDF(LocalDate date) throws IOException {
        // Récupérer tous les emplois du temps pour la date donnée
        List<EmploiDuSurveillance> plannings = emploiDuTempsRepository.findByDate(date);

        // Générer le contenu PDF
        String pdfContent = generateDailyPlanningContent(plannings, date);
        
        // Convertir en bytes (simulation)
        byte[] pdfBytes = pdfContent.getBytes();

        // Créer la ressource
        ByteArrayResource resource = new ByteArrayResource(pdfBytes);

        // Préparer la réponse
        String filename = String.format("planning_quotidien_%s.pdf", 
                date.format(DateTimeFormatter.ISO_LOCAL_DATE));

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .contentLength(pdfBytes.length)
                .body(resource);
    }

    public ResponseEntity<ByteArrayResource> generateComprehensiveReportPDF(LocalDate dateDebut, LocalDate dateFin) throws IOException {
        // Récupérer tous les emplois du temps pour la période
        List<EmploiDuSurveillance> plannings = emploiDuTempsRepository.findByDateBetween(dateDebut, dateFin);

        // Générer le contenu PDF avec statistiques
        String pdfContent = generateComprehensiveReportContent(plannings, dateDebut, dateFin);
        
        // Convertir en bytes (simulation)
        byte[] pdfBytes = pdfContent.getBytes();

        // Créer la ressource
        ByteArrayResource resource = new ByteArrayResource(pdfBytes);

        // Préparer la réponse
        String filename = String.format("rapport_complet_%s_%s.pdf", 
                dateDebut.format(DateTimeFormatter.ISO_LOCAL_DATE),
                dateFin.format(DateTimeFormatter.ISO_LOCAL_DATE));

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .contentLength(pdfBytes.length)
                .body(resource);
    }

    private String generateEnseignantPlanningContent(Enseignant enseignant, List<EmploiDuSurveillance> plannings, LocalDate date) {
        StringBuilder content = new StringBuilder();
        content.append("=== PLANNING ENSEIGNANT ===\n");
        content.append("Enseignant: ").append(enseignant.getNom()).append(" ").append(enseignant.getPrenom()).append("\n");
        content.append("Date: ").append(date.format(DateTimeFormatter.ofPattern("dd/MM/yyyy"))).append("\n");
        content.append("Email: ").append(enseignant.getEmail()).append("\n\n");
        
        content.append("=== EMPLOI DU TEMPS ===\n");
        if (plannings.isEmpty()) {
            content.append("Aucun cours programmé pour cette date.\n");
        } else {
            for (EmploiDuSurveillance planning : plannings) {
                content.append("Heure: ").append(planning.getHeureDebut())
                       .append(" - ").append(planning.getHeureFin()).append("\n");
                content.append("Matière: ").append(planning.getMatiere()).append("\n");
                content.append("Type: ").append(planning.getTypeEpreuve()).append("\n");
                content.append("Salle: ").append(planning.getSalleId()).append("\n");
                content.append("Statut: ").append(planning.getStatut()).append("\n");
                content.append("---\n");
            }
        }
        
        return content.toString();
    }

    private String generateDailyPlanningContent(List<EmploiDuSurveillance> plannings, LocalDate date) {
        StringBuilder content = new StringBuilder();
        content.append("=== PLANNING QUOTIDIEN ===\n");
        content.append("Date: ").append(date.format(DateTimeFormatter.ofPattern("dd/MM/yyyy"))).append("\n\n");
        
        if (plannings.isEmpty()) {
            content.append("Aucun cours programmé pour cette date.\n");
        } else {
            content.append("Nombre total de cours: ").append(plannings.size()).append("\n\n");
            
            for (EmploiDuSurveillance planning : plannings) {
                content.append("Heure: ").append(planning.getHeureDebut())
                       .append(" - ").append(planning.getHeureFin()).append("\n");
                content.append("Matière: ").append(planning.getMatiere()).append("\n");
                content.append("Enseignant ID: ").append(planning.getEnseignantId()).append("\n");
                content.append("Salle: ").append(planning.getSalleId()).append("\n");
                content.append("Type: ").append(planning.getTypeEpreuve()).append("\n");
                content.append("---\n");
            }
        }
        
        return content.toString();
    }

    private String generateComprehensiveReportContent(List<EmploiDuSurveillance> plannings, LocalDate dateDebut, LocalDate dateFin) {
        StringBuilder content = new StringBuilder();
        content.append("=== RAPPORT COMPLET ===\n");
        content.append("Période: ").append(dateDebut.format(DateTimeFormatter.ofPattern("dd/MM/yyyy")))
               .append(" - ").append(dateFin.format(DateTimeFormatter.ofPattern("dd/MM/yyyy"))).append("\n\n");
        
        // Statistiques générales
        content.append("=== STATISTIQUES ===\n");
        content.append("Nombre total de cours: ").append(plannings.size()).append("\n");
        
        long coursCount = plannings.stream().filter(p -> "cours".equalsIgnoreCase(p.getTypeEpreuve())).count();
        long tdCount = plannings.stream().filter(p -> "TD".equalsIgnoreCase(p.getTypeEpreuve())).count();
        long tpCount = plannings.stream().filter(p -> "TP".equalsIgnoreCase(p.getTypeEpreuve())).count();
        
        content.append("- Cours: ").append(coursCount).append("\n");
        content.append("- TD: ").append(tdCount).append("\n");
        content.append("- TP: ").append(tpCount).append("\n\n");
        
        // Détail par statut
        long autoCount = plannings.stream().filter(p -> "AFFECTE_AUTO".equals(p.getStatut())).count();
        long manuelCount = plannings.stream().filter(p -> "AFFECTE_MANUEL".equals(p.getStatut())).count();
        
        content.append("=== RÉPARTITION PAR STATUT ===\n");
        content.append("- Affectation automatique: ").append(autoCount).append("\n");
        content.append("- Affectation manuelle: ").append(manuelCount).append("\n\n");
        
        // Liste détaillée
        content.append("=== DÉTAIL DES COURS ===\n");
        for (EmploiDuSurveillance planning : plannings) {
            content.append("Date: ").append(planning.getDate()).append(" | ");
            content.append("Heure: ").append(planning.getHeureDebut()).append("-").append(planning.getHeureFin()).append(" | ");
            content.append("Matière: ").append(planning.getMatiere()).append(" | ");
            content.append("Salle: ").append(planning.getSalleId()).append("\n");
        }
        
        return content.toString();
    }
}
