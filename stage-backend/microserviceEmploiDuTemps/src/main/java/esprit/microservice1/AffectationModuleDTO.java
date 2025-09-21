package esprit.microservice1;

import lombok.Data;

import java.util.List;

@Data
public class AffectationModuleDTO {
    private Long enseignantId;
    private List<Long> moduleIds;
}
