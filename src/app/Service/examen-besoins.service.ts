import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ExamenBesoins {
  id?: number;
  moduleLibelle: string;
  periode: string;
  nombreGroupes: number;
  nombreClasses: number;
  nombreSalles: number;
  nombreEnseignants: number;
  
}

@Injectable({
  providedIn: 'root'
})
export class ExamenBesoinsService {
  private apiUrl = 'http://localhost:8090/examen-besoins';

  constructor(private http: HttpClient) {}

  save(examenBesoins: ExamenBesoins): Observable<ExamenBesoins> {
    return this.http.post<ExamenBesoins>(this.apiUrl, examenBesoins);
  }

  getAll(): Observable<ExamenBesoins[]> {
    return this.http.get<ExamenBesoins[]>(this.apiUrl);
  }

  getByPeriode(periode: string): Observable<ExamenBesoins[]> {
    return this.http.get<ExamenBesoins[]>(`${this.apiUrl}/periode/${periode}`);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
