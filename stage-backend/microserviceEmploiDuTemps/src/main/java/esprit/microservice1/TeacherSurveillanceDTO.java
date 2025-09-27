package esprit.microservice1;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TeacherSurveillanceDTO {
    private Long teacherId;
    private String teacherName;
    private String teacherFirstName;
    private Long surveillanceHours;
    private Long numberOfExams;
    private String status; // LIBRE, LÉGER, NORMAL, SURCHARGÉ
    private String statusColor; // 🟢, 🟡, 🟠, 🔴
}
