package esprit.microservice1.Service;

import esprit.microservice1.SessionClient;
import esprit.microservice1.SessionDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class ExamenValidationService {

    @Autowired
    private SessionClient sessionClient;

    public ExamenValidationService() {
        System.out.println("🔧 ExamenValidationService initialized");
    }

    /**
     * Valide si une date d'examen est dans la période d'une session pour un module donné
     * @param sessionId ID de la session
     * @param moduleId ID du module
     * @param dateExamen Date de l'examen
     * @return true si la date est valide, false sinon
     */
    public boolean isDateExamenValidForSessionAndModule(Long sessionId, Long moduleId, LocalDate dateExamen) {
        System.out.println("🔍 VALIDATION: ==========================================");
        System.out.println("🔍 VALIDATION: Starting validation process");
        System.out.println("🔍 VALIDATION: Session ID: " + sessionId);
        System.out.println("🔍 VALIDATION: Module ID: " + moduleId);
        System.out.println("🔍 VALIDATION: Exam Date: " + dateExamen);
        System.out.println("🔍 VALIDATION: ==========================================");
        
        try {
            // Récupérer la session depuis le microservice des salles
            System.out.println("🔍 VALIDATION: Calling sessionClient.getSessionById(" + sessionId + ")");
            SessionDTO session = sessionClient.getSessionById(sessionId);
            
            if (session == null) {
                System.out.println("❌ VALIDATION: Session not found for ID " + sessionId);
                return false; // Session non trouvée
            }
            
            System.out.println("📅 VALIDATION: Session found successfully!");
            System.out.println("📅 VALIDATION: Session name: " + session.getNom_session());
            System.out.println("📅 VALIDATION: Session period: " + session.getDateDebut() + " to " + session.getDateFin());
            System.out.println("📅 VALIDATION: Session module IDs: " + session.getModuleIds());
            System.out.println("📅 VALIDATION: Session dateDebut type: " + (session.getDateDebut() != null ? session.getDateDebut().getClass().getSimpleName() : "null"));
            System.out.println("📅 VALIDATION: Session dateFin type: " + (session.getDateFin() != null ? session.getDateFin().getClass().getSimpleName() : "null"));
            
            // Vérifier si le module est assigné à cette session
            if (session.getModuleIds() == null || !session.getModuleIds().contains(moduleId)) {
                System.out.println("❌ VALIDATION: Module " + moduleId + " is NOT assigned to session " + sessionId);
                System.out.println("❌ VALIDATION: Available module IDs in session: " + session.getModuleIds());
                return false;
            }
            
            System.out.println("✅ VALIDATION: Module " + moduleId + " is assigned to session " + sessionId);
            
            // Vérifier si la date de l'examen est dans la période de cette session
            boolean isValid = isDateInSessionPeriod(dateExamen, session);
            System.out.println("🔍 VALIDATION: Date comparison result: " + isValid);
            System.out.println("🔍 VALIDATION: Exam date " + dateExamen + " is " + (isValid ? "VALID" : "INVALID") + " for session period " + session.getDateDebut() + " to " + session.getDateFin());
            
            return isValid;
            
        } catch (Exception e) {
            System.err.println("❌ VALIDATION ERROR: " + e.getMessage());
            System.err.println("❌ VALIDATION ERROR TYPE: " + e.getClass().getSimpleName());
            e.printStackTrace();
            
            // CRITICAL: If there's a connection error, we should NOT allow the exam creation
            // This is a security issue - we must block invalid dates
            if (e.getMessage() != null && (e.getMessage().contains("Connection") || e.getMessage().contains("timeout"))) {
                System.err.println("🚨 CRITICAL VALIDATION ERROR: Cannot validate session dates due to connection error!");
                System.err.println("🚨 BLOCKING exam creation to prevent invalid dates!");
                return false; // BLOCK creation - this is safer
            }
            
            return false;
        }
    }

    /**
     * Vérifie si une date est dans la période d'une session
     * @param dateExamen Date de l'examen
     * @param session Session à vérifier
     * @return true si la date est dans la période
     */
    private boolean isDateInSessionPeriod(LocalDate dateExamen, SessionDTO session) {
        System.out.println("🔍 DATE COMPARISON: ==========================================");
        System.out.println("🔍 DATE COMPARISON: Exam date: " + dateExamen + " (type: " + dateExamen.getClass().getSimpleName() + ")");
        System.out.println("🔍 DATE COMPARISON: Session start: " + session.getDateDebut() + " (type: " + (session.getDateDebut() != null ? session.getDateDebut().getClass().getSimpleName() : "null") + ")");
        System.out.println("🔍 DATE COMPARISON: Session end: " + session.getDateFin() + " (type: " + (session.getDateFin() != null ? session.getDateFin().getClass().getSimpleName() : "null") + ")");
        
        if (session.getDateDebut() == null || session.getDateFin() == null) {
            System.out.println("❌ DATE COMPARISON: Session dates are null - rejecting");
            return false; // Si la session n'a pas de période définie, on refuse
        }
        
        // Test the comparison step by step
        System.out.println("🔍 DATE COMPARISON: Testing dateExamen.isBefore(session.getDateDebut())");
        boolean isBefore = dateExamen.isBefore(session.getDateDebut());
        System.out.println("🔍 DATE COMPARISON: dateExamen.isBefore(session.getDateDebut()) = " + isBefore);
        
        System.out.println("🔍 DATE COMPARISON: Testing dateExamen.isAfter(session.getDateFin())");
        boolean isAfter = dateExamen.isAfter(session.getDateFin());
        System.out.println("🔍 DATE COMPARISON: dateExamen.isAfter(session.getDateFin()) = " + isAfter);
        
        boolean notBefore = !isBefore;
        boolean notAfter = !isAfter;
        boolean result = notBefore && notAfter;
        
        System.out.println("🔍 DATE COMPARISON: Exam date is not before session start: " + notBefore);
        System.out.println("🔍 DATE COMPARISON: Exam date is not after session end: " + notAfter);
        System.out.println("🔍 DATE COMPARISON: Final result: " + result);
        System.out.println("🔍 DATE COMPARISON: ==========================================");
        
        return result;
    }

    /**
     * Retourne le message d'erreur si la date n'est pas valide
     * @param sessionId ID de la session
     * @param moduleId ID du module
     * @param dateExamen Date de l'examen
     * @return Message d'erreur ou null si valide
     */
    public String getValidationErrorMessage(Long sessionId, Long moduleId, LocalDate dateExamen) {
        System.out.println("🔍 ERROR MESSAGE: Getting validation error message for session " + sessionId + ", module " + moduleId + ", date " + dateExamen);
        
        if (isDateExamenValidForSessionAndModule(sessionId, moduleId, dateExamen)) {
            System.out.println("✅ ERROR MESSAGE: Validation passed, no error message needed");
            return null;
        }
        
        try {
            SessionDTO session = sessionClient.getSessionById(sessionId);
            if (session != null) {
                // Check if module is assigned to session
                if (session.getModuleIds() == null || !session.getModuleIds().contains(moduleId)) {
                    String errorMsg = "Le module " + moduleId + " n'est pas assigné à la session " + session.getNom_session() + 
                           ". Veuillez d'abord assigner ce module à la session.";
                    System.out.println("❌ ERROR MESSAGE: " + errorMsg);
                    return errorMsg;
                }
                
                // Module is assigned but date is outside period
                String errorMsg = "La date d'examen (" + dateExamen.toString() + 
                       ") n'est pas dans la période de la session " + session.getNom_session() + 
                       " (" + session.getDateDebut() + " - " + session.getDateFin() + ")";
                System.out.println("❌ ERROR MESSAGE: " + errorMsg);
                return errorMsg;
            }
        } catch (Exception e) {
            System.err.println("❌ ERROR MESSAGE: Erreur lors de la récupération de la session: " + e.getMessage());
        }
        
        String errorMsg = "La date d'examen (" + dateExamen.toString() + 
               ") n'est pas valide pour cette session.";
        System.out.println("❌ ERROR MESSAGE: " + errorMsg);
        return errorMsg;
    }

    /**
     * Debug method to list all sessions
     */
    public void debugListAllSessions() {
        System.out.println("🔍 DEBUG: Listing all sessions...");
        try {
            List<SessionDTO> sessions = sessionClient.getAllSessions();
            System.out.println("🔍 DEBUG: Found " + sessions.size() + " sessions:");
            for (SessionDTO session : sessions) {
                System.out.println("🔍 DEBUG: Session ID: " + session.getId() + 
                                 ", Name: " + session.getNom_session() + 
                                 ", Period: " + session.getDateDebut() + " to " + session.getDateFin() +
                                 ", Modules: " + session.getModuleIds());
            }
        } catch (Exception e) {
            System.err.println("❌ DEBUG ERROR: Cannot list sessions: " + e.getMessage());
        }
    }
}
