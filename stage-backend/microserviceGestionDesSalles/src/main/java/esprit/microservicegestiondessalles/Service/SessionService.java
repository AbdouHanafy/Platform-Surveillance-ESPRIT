package esprit.microservicegestiondessalles.Service;


import esprit.microservicegestiondessalles.Entity.Session;
import esprit.microservicegestiondessalles.Repository.SessionRepository;
import lombok.AllArgsConstructor;
import lombok.Setter;
import org.springframework.stereotype.Service;

import java.util.List;

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


}
