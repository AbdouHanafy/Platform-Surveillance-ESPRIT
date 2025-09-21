package esprit.microservice1.Repository;

import esprit.microservice1.Entity.AffectationModuleGroupe;
import esprit.microservice1.Entity.Periode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface AffectationModuleGroupeRepository extends JpaRepository<AffectationModuleGroupe, Long> {



    List<AffectationModuleGroupe> findByPeriode(Periode periode);

    List<AffectationModuleGroupe> findByModuleIdAndPeriode(Long moduleId, Periode periode);

}
