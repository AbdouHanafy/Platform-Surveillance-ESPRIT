import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Fraude {
  id: number;
  nomEtudiant: string;
  matricule: string;
  nomEnseignant: string;
  matriculeEnseignant: string;
  groupeId: number;
  nomGroupe: string;
  type: string;
  description: string;
  rapport?: string;
  statut: string;
  enseignantId: number;
  roleEnseignant?: string;
}

export interface FraudeRequestDTO {
  nomEtudiant: string;
  matricule: string; // matricule étudiant
  nomEnseignant: string;
  matriculeEnseignant: string;
  groupeId: number;
  nomGroupe: string;
  type: string;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class FraudeService {
  private apiUrl = 'http://localhost:8091/fraudes';

  constructor(private http: HttpClient) { }

  getFraudes(statut?: string): Observable<Fraude[]> {
    if (statut && statut !== 'TOUS') {
      return this.http.get<Fraude[]>(`${this.apiUrl}/statut?statut=${statut}`);
    }
    return this.http.get<Fraude[]>(`${this.apiUrl}/all`);
  }

  declareFraude(fraude: FraudeRequestDTO): Observable<Fraude> {
    return this.http.post<Fraude>(`${this.apiUrl}/declare`, fraude);
  }

  traiterFraude(id: number, rapport: string): Observable<Fraude> {
    return this.http.put<Fraude>(`${this.apiUrl}/traiter/${id}?rapport=${rapport}`, {});
  }

  archiverFraude(id: number): Observable<Fraude> {
    return this.http.put<Fraude>(`${this.apiUrl}/archiver/${id}`, {});
  }
}
