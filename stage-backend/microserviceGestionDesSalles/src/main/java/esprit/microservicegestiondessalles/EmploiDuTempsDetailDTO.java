package esprit.microservicegestiondessalles;

import esprit.microservicegestiondessalles.Entity.EmploiDuTemps;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EmploiDuTempsDetailDTO {
    private EmploiDuTemps emploi;
    private GroupeDTO groupe;
}
