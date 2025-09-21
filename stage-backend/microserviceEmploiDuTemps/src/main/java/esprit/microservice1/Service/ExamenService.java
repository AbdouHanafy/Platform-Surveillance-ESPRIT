package esprit.microservice1.Service;

import esprit.microservice1.Entity.ExamenBesoins;
import esprit.microservice1.Repository.ExamenBesoinsRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class ExamenService {
    private final ExamenBesoinsRepository repository;

    public ExamenBesoins save(ExamenBesoins e) {
        return repository.save(e);
    }

    public List<ExamenBesoins> getAll() {
        return repository.findAll();
    }

    public List<ExamenBesoins> getByPeriode(String periode) {
        return repository.findByPeriode(periode);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }


}
