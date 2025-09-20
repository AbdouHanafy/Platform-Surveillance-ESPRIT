import { Injectable } from '@angular/core';
import { MyModule } from '../Entity/module.model';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Groupe } from '../Entity/Groupe';

@Injectable({
  providedIn: 'root'
})
export class ModuleServiceService {

private baseUrl = 'http://localhost:8090/modules';

  constructor(private http: HttpClient) {}

  getAll(): Observable<MyModule[]> {
    return this.http.get<MyModule[]>(this.baseUrl);
  }

  getById(id: number): Observable<MyModule> {
    return this.http.get<MyModule>(`${this.baseUrl}/${id}`);
  }

  create(module: MyModule): Observable<MyModule> {
    return this.http.post<MyModule>(this.baseUrl, module);
  }

  update(id: number, module: MyModule): Observable<MyModule> {
    return this.http.put<MyModule>(`${this.baseUrl}/${id}`, module);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

   importExcel(file: File): Observable<MyModule[]> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<MyModule[]>(`${this.baseUrl}/import`, formData);
  }

   getAllGroupes(): Observable<Groupe[]> {
    return this.http.get<Groupe[]>(`${this.baseUrl}/allGroupes`);
  }

  getGroupeById(id: number): Observable<Groupe> {
    return this.http.get<Groupe>(`${this.baseUrl}/groupe/${id}`);
  }

  createGroupe(groupe: Groupe): Observable<Groupe> {
    return this.http.post<Groupe>(`${this.baseUrl}/createGroupe`, groupe);
  }

  updateGroupe(id: number, groupe: Groupe): Observable<Groupe> {
    return this.http.put<Groupe>(`${this.baseUrl}/updateGroupe/${id}`, groupe);
  }

  deleteGroupe(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/deleteGroupe/${id}`);
  }

  existsByNomClasse(nomClasse: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/exists/${nomClasse}`);
  }
}
