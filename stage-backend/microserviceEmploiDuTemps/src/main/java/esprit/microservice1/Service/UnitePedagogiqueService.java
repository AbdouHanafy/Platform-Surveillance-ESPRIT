package esprit.microservice1.Service;

import esprit.microservice1.Entity.UnitePedagogique;
import esprit.microservice1.Repository.UnitePedagogiqueRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class UnitePedagogiqueService {

    private final UnitePedagogiqueRepository unitePedagogiqueRepository;

    public List<UnitePedagogique> getAllUnites() {
        return unitePedagogiqueRepository.findAll();
    }
}
