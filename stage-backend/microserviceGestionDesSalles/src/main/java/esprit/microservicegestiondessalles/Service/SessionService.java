package esprit.microservicegestiondessalles.Service;


import esprit.microservicegestiondessalles.Entity.Session;
import esprit.microservicegestiondessalles.Entity.Module;
import esprit.microservicegestiondessalles.Repository.SessionRepository;
import lombok.AllArgsConstructor;
import lombok.Setter;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@AllArgsConstructor
@Service
public class SessionService {

    private final SessionRepository sessionRepository;


    //CRUD

    public void addSession(Session session) {
        sessionRepository.save(session);
    }

    public void deleteSession(Long id) {
        sessionRepository.deleteById(id);
    }

    public Session getSessionById(Long id) {
        return sessionRepository.findById(id).orElse(null);
    }

   public List<Session> getAllSessions() {
        return sessionRepository.findAll();
    }

    public Session updateSession(Session session) {
        return sessionRepository.save(session);
    }

    // Module assignment methods
    public Session assignModulesToSession(Long sessionId, List<Long> moduleIds) {
        System.out.println("SessionService: Assigning modules to session " + sessionId);
        System.out.println("SessionService: Module IDs: " + moduleIds);
        
        try {
            Optional<Session> sessionOpt = sessionRepository.findById(sessionId);
            if (sessionOpt.isPresent()) {
                Session session = sessionOpt.get();
                System.out.println("SessionService: Found session: " + session.getNom_session());
                
                // Set the module IDs directly
                session.setModuleIds(moduleIds);
                System.out.println("SessionService: Setting " + moduleIds.size() + " module IDs to session");
                
                Session savedSession = sessionRepository.save(session);
                System.out.println("SessionService: Successfully saved session with module IDs");
                return savedSession;
            } else {
                System.out.println("SessionService: Session not found with ID: " + sessionId);
            }
        } catch (Exception e) {
            System.err.println("SessionService: Error assigning modules: " + e.getMessage());
            e.printStackTrace();
        }
        return null;
    }

    public List<Long> getSessionModules(Long sessionId) {
        Optional<Session> sessionOpt = sessionRepository.findById(sessionId);
        return sessionOpt.map(Session::getModuleIds).orElse(List.of());
    }

    public boolean removeModuleFromSession(Long sessionId, Long moduleId) {
        Optional<Session> sessionOpt = sessionRepository.findById(sessionId);
        if (sessionOpt.isPresent()) {
            Session session = sessionOpt.get();
            boolean removed = session.getModuleIds().removeIf(id -> id.equals(moduleId));
            if (removed) {
                sessionRepository.save(session);
                return true;
            }
        }
        return false;
    }


}
