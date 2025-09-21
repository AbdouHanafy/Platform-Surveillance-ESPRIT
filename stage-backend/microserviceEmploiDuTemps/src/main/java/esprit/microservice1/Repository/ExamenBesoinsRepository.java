package esprit.microservice1.Repository;

import esprit.microservice1.Entity.ExamenBesoins;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExamenBesoinsRepository extends JpaRepository<ExamenBesoins,Long> {
    List<ExamenBesoins> findByPeriode(String periode);

}
