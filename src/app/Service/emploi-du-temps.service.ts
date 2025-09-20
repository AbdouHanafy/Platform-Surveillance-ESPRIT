// src/app/services/emploi-du-temps.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Enseignant } from '../Entity/Enseignant';

export interface EmploiDuTemps {
  id: any;
 enseignantId: number;
  date: string;
  heureDebut: string;
  heureFin: string;
  typeActivite: string;
  salle: string;  
 groupeId: number;
 

}

export interface EmploiSurveillance {
  enseignant: {
    id: number;
  };
  date: string;         // format YYYY-MM-DD
  heureDebut: string;   // format HH:mm
  heureFin: string;     // format HH:mm
  salleId: number;
  semestre: number;
}


export interface Salle {
  id: number;
  nom: string;
}

export interface Groupe {
  id: number;
  nomClasse: string;
  niveau: string;
  optionGroupe: string;
  effectif: number;
  departement: string;
}




@Injectable({
  providedIn: 'root'
})
export class EmploiDuTempsService {

  private baseUrl = 'http://localhost:8090/ensignat';
  
  private URL = 'http://localhost:8090/emplois';
  private Url = 'http://localhost:8093/emploi_enseignant';

  constructor(private http: HttpClient) {}

 getAllGroupes(): Observable<Groupe[]> {
    return this.http.get<Groupe[]>(`${this.Url}/groupes/all`);
  }

 getAll(): Observable<Enseignant[]> {
    return this.http.get<Enseignant[]>(`${this.baseUrl}/getAllEnseignants`);
  }


  //add emploi du temps
  create(emploi: EmploiDuTemps): Observable<EmploiDuTemps> {
  return this.http.post<EmploiDuTemps>(`${this.Url}/create`, emploi);
  }


 getByEnseignant(id: number): Observable<EmploiDuTemps[]> {
    return this.http.get<EmploiDuTemps[]>(`${this.Url}/enseignant/${id}`);
  }




  /**
   * Planifier un emploi de surveillance
   */
  planifier(surveillance: EmploiSurveillance): Observable<any> {
    return this.http.post(`${this.URL}/planifier`, surveillance, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    });
  }


  getEmploisFiltres(
  enseignantId?: number | null,
  groupeId?: number | null,
  date?: string | null
): Observable<EmploiDuTemps[]> {
  let params = new HttpParams();
  if (enseignantId != null) params = params.set('enseignantId', enseignantId.toString());
  if (groupeId != null) params = params.set('groupeId', groupeId.toString());
  if (date) params = params.set('date', date);

  return this.http.get<EmploiDuTemps[]>(`${this.Url}/filter`, { params });
}
getEmploisParSalle(salleNom: string): Observable<EmploiDuTemps[]> {
  return this.http.get<EmploiDuTemps[]>(`${this.Url}/salle/${salleNom}`);
}





}
