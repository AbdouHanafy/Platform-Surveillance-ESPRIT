import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { Enseignant } from '../Entity/Enseignant';
import { MyModule } from '../Entity/module.model';
import { UnitePedagogique } from '../Entity/unite-pedagogique.model';
import { User } from '../Entity/User';
import { UserCreate } from '../Entity/UserCreate ';
import { EnseignantAvecModules } from '../Entity/EnseignantAvecModules';



@Injectable({
  providedIn: 'root'
})
export class EnseignantService {

  private baseUrl = 'http://localhost:8090/ensignat';

  constructor(private http: HttpClient) { }

// Nouveau : register user + enseignant ensemble
registerUserAndEnseignant(user: UserCreate, enseignant: Partial<Enseignant>): Observable<any> {
  const payload = { user, enseignant };
  return this.http.post<any>(`${this.baseUrl}/registerEnseignant`, payload);
}

  getAllUnites(): Observable<UnitePedagogique[]> {
    return this.http.get<UnitePedagogique[]>(`${this.baseUrl}/unite-pedagogiques`);
  }
  getAllEnseignants(): Observable<Enseignant[]> {
    return this.http.get<Enseignant[]>(`${this.baseUrl}/getAllEnseignants`);
  }
  addEnseignant(enseignant: Enseignant): Observable<Enseignant> {
    return this.http.post<Enseignant>(`${this.baseUrl}/addEnsignat`, enseignant);
  }

   getEnseignantById(id: number): Observable<Enseignant> {
    return this.http.get<Enseignant>(`${this.baseUrl}/id/${id}`);
  }


    getAllModules(): Observable<MyModule[]> {
    return this.http.get<MyModule[]>(`${this.baseUrl}/modules`);
  }
    updateEnseignant(id: number, enseignant: Enseignant): Observable<Enseignant> {
    return this.http.put<Enseignant>(`${this.baseUrl}/update/${id}`, enseignant);
  }

  // **Méthode delete**
  deleteEnseignant(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/deleteEnsignat/${id}`);
  }
    // Nouvelle méthode : affecter plusieurs modules à un enseignant
  affecterModules(payload: { enseignantId: number; moduleIds: number[] }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/affecterModules`, payload);
  }

  
getEnseignantsAvecModules(): Observable<EnseignantAvecModules[]> {
  return this.http.get<EnseignantAvecModules[]>(`${this.baseUrl}/enseignants/modules`);
}


getModulesByUnite(uniteId: number): Observable<MyModule[]> {
  return this.http.get<MyModule[]>(`${this.baseUrl}/modules/by-unite/${uniteId}`);
}
supprimerModuleAffecte(enseignantId: number, moduleId: number) {
  return this.http.delete<void>(`${this.baseUrl}/${enseignantId}/modules/${moduleId}`);
}
deleteModuleAffecte(enseignantId: number, moduleId: number): Observable<any> {
  return this.http.delete(`${this.baseUrl}/${enseignantId}/modules/${moduleId}`);
}

}
