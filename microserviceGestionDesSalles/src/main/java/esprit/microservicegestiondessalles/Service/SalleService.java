package esprit.microservicegestiondessalles.Service;


import esprit.microservicegestiondessalles.Entity.ReservationSalle;
import esprit.microservicegestiondessalles.Entity.Salle;
import esprit.microservicegestiondessalles.Repository.ReservationSalleRepository;
import esprit.microservicegestiondessalles.Repository.SalleRepository;
import lombok.AllArgsConstructor;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
public class SalleService {

    @Autowired
    private SalleRepository salleRepository;

    @Autowired
    private final ReservationSalleRepository reservationSalleRepository;

    public List<Salle> getAllSalles() {
        return salleRepository.findAll();
    }

    public Optional<Salle> getSalleById(Long id) {
        return salleRepository.findById(id);
    }


    public Salle createSalle(Salle salle) {

        salle.setEstReservee(false);
        return salleRepository.save(salle);
    }




    public Salle updateSalle(Long id, Salle salleDetails) {
        Salle salle = salleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Salle non trouvée"));

        salle.setNom(salleDetails.getNom());
        salle.setCapacite(salleDetails.getCapacite());
        salle.setBloc(salleDetails.getBloc());
        salle.setEtage(salleDetails.getEtage());

        return salleRepository.save(salle);
    }

    public void deleteSalle(Long id) {
        salleRepository.deleteById(id);
    }



    public boolean verifierDisponibiliteSalle(Long salleId, LocalDate date, LocalTime heureDebut, LocalTime heureFin) {
        int nombreEnseignants = reservationSalleRepository.countEnseignantsReservantSallePourPeriode(salleId, date, heureDebut, heureFin);
        return nombreEnseignants < 2;
    }

    public List<Salle> getSallesAvecEtatActuel() {
        List<Salle> salles = salleRepository.findAll();
        LocalDate nowDate = LocalDate.now();
        LocalTime nowTime = LocalTime.now();

        List<ReservationSalle> reservationsActuelles = reservationSalleRepository.findReservationsActuelles(nowDate, nowTime);

        for (Salle salle : salles) {
            boolean reservee = reservationsActuelles.stream()
                    .anyMatch(r -> r.getSalle().getId().equals(salle.getId()));
            salle.setEstReservee(reservee);
        }

        return salles;
    }


    public void importerSallesDepuisExcel(MultipartFile file) throws Exception {
        try (InputStream is = file.getInputStream()) {
            Workbook workbook = new XSSFWorkbook(is);
            Sheet sheet = workbook.getSheetAt(0);

            for (Row row : sheet) {
                if (row.getRowNum() == 0) continue; // Ignorer l'entête

                String nom = row.getCell(0).getStringCellValue();
                int capacite = (int) row.getCell(1).getNumericCellValue();
                String bloc = row.getCell(2).getStringCellValue();
                int etage = (int) row.getCell(3).getNumericCellValue();

                Optional<Salle> optSalle = salleRepository.findByNom(nom);

                if (optSalle.isPresent()) {
                    Salle salleExistante = optSalle.get();
                    salleExistante.setCapacite(capacite);
                    salleExistante.setBloc(bloc);
                    salleExistante.setEtage(etage);
                    salleExistante.setEstReservee(false);
                    salleRepository.save(salleExistante);
                } else {
                    Salle nouvelleSalle = Salle.builder()
                            .nom(nom)
                            .capacite(capacite)
                            .bloc(bloc)
                            .etage(etage)
                            .estReservee(false)
                            .build();
                    salleRepository.save(nouvelleSalle);
                }
            }
            workbook.close();
        }
    }

    public List<Salle> getSallesByIds(List<Long> ids) {
        return salleRepository.findAllById(ids);
    }

}

