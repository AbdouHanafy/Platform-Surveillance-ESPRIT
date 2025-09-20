package esprit.microservicegestiondesfraude;

import esprit.microservicegestiondesfraude.configuration.FeignClientConfig;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;


@FeignClient(name = "microservice1", contextId = "fraude2",url = "http://localhost:8090",configuration = FeignClientConfig.class)
public interface EnseignantClient {

    @GetMapping("/ensignat/matricule/{matricule}")
    EnseignantDTO getEnseignantByMatricule(@PathVariable("matricule") String matricule);



    @GetMapping("/ensignat/id/{id}")
    EnseignantDTO getEnseignantById(@PathVariable("id") Long id);
}
