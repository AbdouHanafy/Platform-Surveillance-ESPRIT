package esprit.microservicegestiondessalles;

import esprit.microservicegestiondessalles.configuration.FeignClientConfig;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@FeignClient(name = "microservice1", contextId = "enseignant3",url = "http://localhost:8090",configuration = FeignClientConfig.class)
public interface GroupeClient {

    @GetMapping("emplois/groupe/{id}")
    GroupeDTO getGroupeById(@PathVariable Long id);

    @GetMapping("/emplois/groupes/all")
    List<GroupeDTO> getAllGroupes();

}
