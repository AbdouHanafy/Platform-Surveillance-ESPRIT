    package esprit.microservicegestiondesfraude;

    import esprit.microservicegestiondesfraude.configuration.FeignClientConfig;
    import org.springframework.cloud.openfeign.FeignClient;
    import org.springframework.web.bind.annotation.GetMapping;
    import org.springframework.web.bind.annotation.PathVariable;

    @FeignClient(name = "user-service", contextId = "fraude1",url = "http://localhost:8088", configuration = FeignClientConfig.class)
    public interface UserClient {

        @GetMapping("/auth/matricule/{matricule}")
        UserDTO getUserByMatricule(@PathVariable String matricule);
    }
