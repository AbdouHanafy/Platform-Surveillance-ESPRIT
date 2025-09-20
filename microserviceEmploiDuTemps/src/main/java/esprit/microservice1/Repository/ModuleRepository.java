package esprit.microservice1.Repository;


import esprit.microservice1.Entity.MyModule;
import esprit.microservice1.Entity.Periode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ModuleRepository extends JpaRepository<MyModule,Long> {


    List<MyModule> findByUnitePedagogiqueId(Long uniteId);


}
