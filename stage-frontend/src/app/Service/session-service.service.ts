import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Session } from '../Entity/Session';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SessionServiceService {
   private apiUrl = 'http://localhost:8093/sessions';
  


   constructor(private http: HttpClient) {}

  getAll(): Observable<Session[]> {
    return this.http.get<Session[]>(this.apiUrl);
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
}


