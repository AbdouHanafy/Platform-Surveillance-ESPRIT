import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';
import { Salle } from '../Entity/Salle';

export interface HistoriqueReservation {
  id: number;
  dateModification: string;
  etatReservation: string;
  // add more fields if needed
}


export interface ReservationSalle {
  id?: number;                // optionnel car peut être absent avant sauvegarde
  dateExamen: string;         // ISO date, ex: "2025-07-22"
  heureDebut: string;         // heure format "HH:mm", ex: "08:30"
  heureFin: string;           // heure format "HH:mm", ex: "10:00"
  enseignantId?: number;      // id de l'enseignant, optionnel si parfois absent
  statut: 'Occupé' | 'Libre';
  salle: {
    id: number;               // id de la salle associée
    nom?: string;             // optionnel, utile pour affichage
    bloc?: string;
    etage?: number;
    capacite?: number;
    estReservee?: boolean;
  };
}


@Injectable({
  providedIn: 'root'
})
export class SalleService {
   private baseUrl = 'http://localhost:8093/salles';
  private reservationBaseUrl = 'http://localhost:8093/reservations';

  constructor(private http: HttpClient) {}

  getAllSalles(): Observable<Salle[]> {
    return this.http.get<Salle[]>(`${this.baseUrl}`);
  }

  createSalle(salle: Salle): Observable<Salle> {
    return this.http.post<Salle>(this.baseUrl, salle);
  }

  createReservation(reservation: any, matricule: string) {
    return this.http.post(`${this.reservationBaseUrl}/${matricule}`, reservation);
  }

  getSallesWithStatus(): Observable<Salle[]> {
    return this.http.get<Salle[]>(`${this.reservationBaseUrl}/salles-status`)
      .pipe(
        map((salles: Salle[]) => salles.map((salle: Salle) => {
          salle.status = salle.estReservee ? 'Réservé' : 'Libre';
          return salle;
        }))
      );
  }
    getHistoriqueByReservationId(reservationId: number): Observable<HistoriqueReservation[]> {
    return this.http.get<HistoriqueReservation[]>(`${this.reservationBaseUrl}/historique/${reservationId}`);
  }
  getHistoriqueParSalle(salleId: number): Observable<HistoriqueReservation[]> {
  return this.http.get<HistoriqueReservation[]>(`${this.reservationBaseUrl}/salles/${salleId}/historique`);
}



getReservationsFuturesParSalle(salleId: number): Observable<ReservationSalle[]> {
  return this.http.get<ReservationSalle[]>(`http://localhost:8093/reservations/salle/${salleId}/disponibilites`);
}
getReservationsFutureBySalle(salleId: number): Observable<any[]> {
  return this.http.get<any[]>(`${this.reservationBaseUrl}/salles/${salleId}/futures`);
}

getDisponibilitesParSalle(salleId: number): Observable<ReservationSalle[]> {
  return this.http.get<ReservationSalle[]>(`http://localhost:8093/reservations/salle/${salleId}/disponibilites`);
}



 getReservationsParSalleEtDate(salleId: number, date: string): Observable<ReservationSalle[]> {
    const params = new HttpParams().set('date', date);
    return this.http.get<ReservationSalle[]>(`${this.reservationBaseUrl}/salle/${salleId}`, { params });
  }

  
importSallesFromExcel(formData: FormData) {
  return this.http.post('http://localhost:8093/salles/import', formData, {
    responseType: 'text' // <== AJOUTER CECI
  });
}
// Dans salle-service.service.ts
getSallesByIds(ids: number[]): Observable<Salle[]> {
  if (!ids || ids.length === 0) {
    return of([]);
  }
 
  const params = ids.map(id => `ids=${id}`).join('&');
  return this.http.get<Salle[]>(`${this.baseUrl}/batch?${params}`).pipe(
    catchError(err => {
      console.error('Erreur récupération salles batch', err);
      return of([]);
    })
  );
}


}
