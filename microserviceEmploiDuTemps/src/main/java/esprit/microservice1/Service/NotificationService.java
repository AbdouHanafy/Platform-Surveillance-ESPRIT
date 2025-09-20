package esprit.microservice1.Service;

import lombok.AllArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class NotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    // Envoie une notif à un utilisateur spécifique
    public void notifyEnseignant(Long enseignantId, String message) {
        System.out.println("Sending notification to enseignant ID: " + enseignantId + " with message: " + message);

        // Méthode 1: Utiliser convertAndSendToUser (nécessite que l'utilisateur soit connecté)
        messagingTemplate.convertAndSendToUser(
                enseignantId.toString(),
                "/queue/notifications",
                message
        );

        // Méthode 2: Envoyer aussi sur le topic spécifique comme fallback
        messagingTemplate.convertAndSend(
                "/topic/enseignant/" + enseignantId,
                message
        );

        System.out.println("Notification sent successfully to enseignant ID: " + enseignantId);
    }
}
