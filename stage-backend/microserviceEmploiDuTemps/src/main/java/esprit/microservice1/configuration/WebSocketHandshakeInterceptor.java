package esprit.microservice1.configuration;


import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.lang.Nullable;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.security.Principal;
import java.util.Map;

@Component
public class WebSocketHandshakeInterceptor implements HandshakeInterceptor {

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler,
                                   Map<String, Object> attributes) throws Exception {

        // Exemple : récupérer l'ID envoyé en paramètre ?id=123
        String query = request.getURI().getQuery(); // id=123
        Long enseignantId = null;
        if (query != null && query.startsWith("id=")) {
            enseignantId = Long.valueOf(query.substring(3));
        }

        if (enseignantId != null) {
            final Long finalEnseignantId = enseignantId; // <-- rend final
            attributes.put("user", new Principal() {
                @Override
                public String getName() {
                    return finalEnseignantId.toString(); // <-- utiliser la variable finale
                }
            });
        }

        return true;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                               WebSocketHandler wsHandler, @Nullable Exception exception) { }
}
