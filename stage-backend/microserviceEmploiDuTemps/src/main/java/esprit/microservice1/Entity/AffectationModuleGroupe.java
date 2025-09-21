    package esprit.microservice1.Entity;

    import jakarta.persistence.*;
    import lombok.*;

    @Entity
    @Table(name = "affectation_module_groupe")
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public class AffectationModuleGroupe {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        @ManyToOne
        private MyModule module;

        @ManyToOne
        private Groupe groupe;

        @Enumerated(EnumType.STRING)
        private Periode periode;
    }
