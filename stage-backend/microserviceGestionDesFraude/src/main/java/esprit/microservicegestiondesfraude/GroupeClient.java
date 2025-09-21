package esprit.microservicegestiondesfraude;

import esprit.microservicegestiondesfraude.configuration.FeignClientConfig;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import java.util.List;

@FeignClient(name = "microservice1", url = "http://localhost:8090", configuration = FeignClientConfig.class)
public interface GroupeClient {

    @GetMapping("/groupes/{id}")
    GroupeDTO getGroupeById(@PathVariable("id") Long id);

    @GetMapping("/groupes")
    List<GroupeDTO> getAllGroupes();
}
