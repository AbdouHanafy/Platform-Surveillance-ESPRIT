package esprit.microservice1;


import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@FeignClient(name = "microserviceGestionDesSalles",contextId = "salleClient3", url = "http://localhost:8093")
public interface SessionClient {



    @GetMapping("/sessions")
    List<SessionDTO> getAllSessions();

    @GetMapping("/sessions/{id}")
    SessionDTO getSessionById(@PathVariable("id") Long id);

    @GetMapping("/sessions/by-periode/{periode}")
    List<SessionDTO> getSessionsByPeriode(@PathVariable("periode") String periode);
}
