package esprit.microservice1.Controller;
import esprit.microservice1.Service.NotificationService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@Controller
@CrossOrigin("*")
@AllArgsConstructor
public class NotificationController {

    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationService notificationService;



    // Quand Angular envoie un message sur /app/send-notification
    @MessageMapping("/send-notification")
    public void receiveNotification(String message) {
        // On renvoie à tous les abonnés du topic
        messagingTemplate.convertAndSend("/topic/notifications", message);
    }

    // Si tu veux notifier un enseignant spécifique
    public void notifyEnseignant(Long enseignantId, String chronoName) {
        messagingTemplate.convertAndSend("/topic/enseignant/" + enseignantId,
                "Un nouveau chrono a été créé: " + chronoName);
    }


    @GetMapping("/test-notif/{enseignantId}")
    public ResponseEntity<String> testNotif(@PathVariable Long enseignantId) {
        System.out.println("Testing notification for enseignant ID: " + enseignantId);
        notificationService.notifyEnseignant(enseignantId, "Test notification - " + System.currentTimeMillis());
        return ResponseEntity.ok("Notification envoyée à l'enseignant " + enseignantId);
    }

    @GetMapping("/test-notif-multiple")
    public ResponseEntity<String> testNotifMultiple() {
        // Test avec plusieurs enseignants (Iheb et Samara par exemple)
        Long[] enseignantIds = {54L, 52L}; // IDs d'Iheb et Samara
        for (Long enseignantId : enseignantIds) {
            System.out.println("Testing notification for enseignant ID: " + enseignantId);
            notificationService.notifyEnseignant(enseignantId,
                    "Test notification multiple - " + System.currentTimeMillis());
        }
        return ResponseEntity.ok("Notifications envoyées à " + enseignantIds.length + " enseignants");
    }

}
