package esprit.microservice1.Entity;

import lombok.Data;
import java.util.List;

@Data
public class AffectationRequestDTO {
    private Long moduleId;
    private List<Long> groupeIds;
    private Periode periode;
}
