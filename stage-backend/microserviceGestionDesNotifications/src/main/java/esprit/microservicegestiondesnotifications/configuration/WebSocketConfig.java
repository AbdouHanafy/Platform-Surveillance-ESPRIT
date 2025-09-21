package esprit.microservicegestiondesnotifications.configuration;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // le serveur envoie sur ces destinations (topic = broadcast, queue = par utilisateur)
        config.enableSimpleBroker("/topic", "/queue");
        // préfixe pour les requêtes envoyées au serveur via @MessageMapping
        config.setApplicationDestinationPrefixes("/app");
        // préfixe spécial pour les notifs ciblées /user/{username}/queue
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws") // endpoint websocket
                .setAllowedOrigins("http://localhost:4200") // autoriser Angular
                .withSockJS(); // compatibilité navigateurs anciens
    }
}
