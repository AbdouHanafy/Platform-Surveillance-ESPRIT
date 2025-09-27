export interface SalleReservation {
  examenId: number;
  moduleLibelle: string;
  groupeNom: string;
  dateExamen: string;
  seance: string;
  enseignantNom: string;
  enseignantPrenom: string;
  statut: 'RÉSERVÉ' | 'DISPONIBLE';
}
