export interface TeacherSurveillance {
  teacherId: number;
  teacherName: string;
  teacherFirstName: string;
  surveillanceHours: number;
  numberOfExams: number;
  status: 'LIBRE' | 'LÉGER' | 'NORMAL' | 'SURCHARGÉ';
  statusColor: string;
}
