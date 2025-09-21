import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MyModule } from '../Entity/module.model';
import { Groupe } from './emploi-du-temps.service';
import { Enseignant } from '../Entity/Enseignant';

export interface ExamenChronoRequestDTO {
  sessionId: number;
  periode: 'PRINCIPAL' | 'RATTRAPAGE';
  moduleId: number;
  groupeId: number;
  dateExamen: string;
  seance: string;
        // optionnel si tu envoies groupesIds
  groupesIds?: number[];
   
}



export interface ExamenChrono {
  id: number;
  sessionId: number;
  periode: string;
  module: MyModule;
  groupe: Groupe;
  dateExamen: string;
  seance: string;
  enseignants: Enseignant[];
  salleIds: number[];
   salleNames?: string;
}


export interface ModuleDTO {
  id: number;
  libelleModule: string;
}

export interface GroupeDTO {
  id: number;
  nomClasse: string;
}


@Injectable({
  providedIn: 'root'
})
export class ExamenChronoService {
  private apiUrl = 'http://localhost:8090/examen-chrono';
 private baseUrl = 'http://localhost:8090/ensignat';
 private Url = 'http://localhost:8093/emploi_enseignant';
  constructor(private http: HttpClient) {}

  createExamen(examen: ExamenChronoRequestDTO): Observable<ExamenChrono> {
    return this.http.post<ExamenChrono>(`${this.apiUrl}/create`, examen);
  }

  getAllExamens(): Observable<ExamenChrono[]> {
    return this.http.get<ExamenChrono[]>(`${this.apiUrl}/all`);
  }

  getExamenById(id: number): Observable<ExamenChrono> {
    return this.http.get<ExamenChrono>(`${this.apiUrl}/${id}`);
  }

  // Services supplémentaires pour les données de référence
  getModules(): Observable<MyModule[]> {
    return this.http.get<MyModule[]>(`${this.baseUrl}/modules`);
  }

   
  getGroupes(): Observable<Groupe[]> {
  return this.http.get<Groupe[]>(`${this.Url}/groupes/all`);
  }

    
 

 
}