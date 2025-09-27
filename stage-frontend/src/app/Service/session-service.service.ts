import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Session } from '../Entity/Session';
import { MyModule } from '../Entity/module.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SessionServiceService {
   private apiUrl = 'http://localhost:8093/sessions';
  


   constructor(private http: HttpClient) {}

  getAll(): Observable<Session[]> {
    console.log('SessionService: Making GET request to:', this.apiUrl);
    return this.http.get<Session[]>(this.apiUrl, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
  }

  getById(id: number): Observable<Session> {
    return this.http.get<Session>(`${this.apiUrl}/${id}`);
  }

  add(session: Session): Observable<Session> {
    return this.http.post<Session>(this.apiUrl, session);
  }

  update(session: Session): Observable<Session> {
    return this.http.put<Session>(`${this.apiUrl}/${session.id}`, session);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Module assignment methods
  assignModulesToSession(sessionId: number, moduleIds: number[]): Observable<Session> {
    return this.http.post<Session>(`${this.apiUrl}/${sessionId}/modules`, moduleIds);
  }

  getSessionModules(sessionId: number): Observable<number[]> {
    return this.http.get<number[]>(`${this.apiUrl}/${sessionId}/modules`);
  }

  removeModuleFromSession(sessionId: number, moduleId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${sessionId}/modules/${moduleId}`);
  }
}


