package esprit.microservicegestiondessalles.Controller;

import esprit.microservicegestiondessalles.Entity.Session;
import esprit.microservicegestiondessalles.Entity.Module;
import esprit.microservicegestiondessalles.Service.SessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/sessions")
@RequiredArgsConstructor
public class SessionController {

    private final SessionService sessionService;

    // ✅ Ajouter une session
    @PostMapping
    public ResponseEntity<Session> addSession(@RequestBody Session session) {
        sessionService.addSession(session);
        return ResponseEntity.ok(session);
    }

    // ✅ Supprimer une session
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSession(@PathVariable Long id) {
        sessionService.deleteSession(id);
        return ResponseEntity.noContent().build();
    }

    // ✅ Récupérer une session par ID
    @GetMapping("/{id}")
    public ResponseEntity<Session> getSessionById(@PathVariable Long id) {
        Session session = sessionService.getSessionById(id);
        return session != null ? ResponseEntity.ok(session) : ResponseEntity.notFound().build();
    }

    // ✅ Récupérer toutes les sessions
    @GetMapping
    public ResponseEntity<List<Session>> getAllSessions() {
        return ResponseEntity.ok(sessionService.getAllSessions());
    }

    // ✅ Mettre à jour une session
    @PutMapping("/{id}")
    public ResponseEntity<Session> updateSession(@PathVariable Long id, @RequestBody Session session) {
        Session existing = sessionService.getSessionById(id);
        if (existing == null) {
            return ResponseEntity.notFound().build();
        }

        session.setId(id); // pour s'assurer que l'ID reste le même
        Session updated = sessionService.updateSession(session);
        return ResponseEntity.ok(updated);
    }

    // ✅ Assigner des modules à une session
    @PostMapping("/{sessionId}/modules")
    public ResponseEntity<Session> assignModulesToSession(
            @PathVariable Long sessionId, 
            @RequestBody List<Long> moduleIds) {
        System.out.println("Received request to assign modules to session: " + sessionId);
        System.out.println("Module IDs: " + moduleIds);
        
        Session updatedSession = sessionService.assignModulesToSession(sessionId, moduleIds);
        
        if (updatedSession != null) {
            System.out.println("Successfully assigned modules to session: " + updatedSession.getId());
            return ResponseEntity.ok(updatedSession);
        } else {
            System.out.println("Failed to assign modules - session not found: " + sessionId);
            return ResponseEntity.notFound().build();
        }
    }

    // ✅ Récupérer les modules d'une session
    @GetMapping("/{sessionId}/modules")
    public ResponseEntity<List<Long>> getSessionModules(@PathVariable Long sessionId) {
        List<Long> moduleIds = sessionService.getSessionModules(sessionId);
        return ResponseEntity.ok(moduleIds);
    }

    // ✅ Supprimer un module d'une session
    @DeleteMapping("/{sessionId}/modules/{moduleId}")
    public ResponseEntity<Void> removeModuleFromSession(
            @PathVariable Long sessionId, 
            @PathVariable Long moduleId) {
        boolean success = sessionService.removeModuleFromSession(sessionId, moduleId);
        return success ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }

}
