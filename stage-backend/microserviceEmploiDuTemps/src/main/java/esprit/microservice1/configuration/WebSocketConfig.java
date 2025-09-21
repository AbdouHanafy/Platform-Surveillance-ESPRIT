package esprit.microservice1.configuration;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import java.security.Principal;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Autowired
    private WebSocketHandshakeInterceptor handshakeInterceptor;


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
        // Ici l'URL de connexion WebSocket STOMP


        //support

        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .addInterceptors(handshakeInterceptor);  // WebSocket endpoint

        // ou sans SockJS
        // registry.addEndpoint("/ws").setAllowedOrigins("*");
    }


    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
                if (StompCommand.CONNECT.equals(accessor.getCommand())) {
                    // Par exemple, tu forces le nom du principal à l'ID utilisateur
                    accessor.setUser(new Principal() {
                        @Override
                        public String getName() {
                            return accessor.getFirstNativeHeader("id"); // ou ton système d'authentification
                        }
                    });
                }
                return message;
            }
        });
    }

}
