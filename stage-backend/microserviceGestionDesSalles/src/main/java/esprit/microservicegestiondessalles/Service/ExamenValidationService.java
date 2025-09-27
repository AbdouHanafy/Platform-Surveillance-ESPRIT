package esprit.microservicegestiondessalles.Service;

import esprit.microservicegestiondessalles.Entity.Session;
import esprit.microservicegestiondessalles.Repository.SessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class ExamenValidationService {

    @Autowired
    private SessionRepository sessionRepository;

    /**
     * Valide si une date d'examen est dans la période d'une session pour un module donné
     * @param moduleId ID du module
     * @param dateExamen Date de l'examen
     * @return true si la date est valide, false sinon
     */
    public boolean isDateExamenValidForModule(Long moduleId, LocalDate dateExamen) {
        // Récupérer toutes les sessions qui contiennent ce module
        List<Session> sessions = sessionRepository.findAll();
        
        for (Session session : sessions) {
            if (session.getModuleIds() != null && session.getModuleIds().contains(moduleId)) {
                // Vérifier si la date de l'examen est dans la période de cette session
                if (isDateInSessionPeriod(dateExamen, session)) {
                    return true;
                }
            }
        }
        
        return false;
    }

    /**
     * Vérifie si une date est dans la période d'une session
     * @param dateExamen Date de l'examen
     * @param session Session à vérifier
     * @return true si la date est dans la période
     */
    private boolean isDateInSessionPeriod(LocalDate dateExamen, Session session) {
        if (session.getDateDebut() == null || session.getDateFin() == null) {
            return false; // Si la session n'a pas de période définie, on refuse
        }
        
        return !dateExamen.isBefore(session.getDateDebut()) && 
               !dateExamen.isAfter(session.getDateFin());
    }

    /**
     * Retourne le message d'erreur si la date n'est pas valide
     * @param moduleId ID du module
     * @param dateExamen Date de l'examen
     * @return Message d'erreur ou null si valide
     */
    public String getValidationErrorMessage(Long moduleId, LocalDate dateExamen) {
        if (isDateExamenValidForModule(moduleId, dateExamen)) {
            return null;
        }
        
        // Récupérer les sessions qui contiennent ce module pour donner un message informatif
        List<Session> sessions = sessionRepository.findAll();
        StringBuilder message = new StringBuilder("La date d'examen (");
        message.append(dateExamen.toString());
        message.append(") n'est pas dans la période de session pour ce module. ");
        
        boolean foundSessions = false;
        for (Session session : sessions) {
            if (session.getModuleIds() != null && session.getModuleIds().contains(moduleId)) {
                if (!foundSessions) {
                    message.append("Périodes valides: ");
                    foundSessions = true;
                } else {
                    message.append(", ");
                }
                message.append(session.getNom_session())
                       .append(" (")
                       .append(session.getDateDebut())
                       .append(" - ")
                       .append(session.getDateFin())
                       .append(")");
            }
        }
        
        if (!foundSessions) {
            message.append("Aucune session trouvée pour ce module.");
        }
        
        return message.toString();
    }
}

