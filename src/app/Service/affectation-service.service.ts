import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MyModule } from '../Entity/module.model';
import { Groupe } from '../Entity/Groupe';

export interface AffectationRequestDTO {
  moduleId: number;
  groupeIds: number[];
  periode: string;
}

export interface AffectationModuleGroupe {
  id: number;
  module: {
    idModule: number;
    libelleModule: string;
  };
  groupe: {
    id: number;
    nomClasse: string;
    optionGroupe : string;
    effectif : number;
    departement : string;
    niveau : string;
  };
  periode: string;
  // Optional properties for assignment status
  salleAffectee?: boolean;
  enseignantAffecte?: boolean;
  salleNom?: string;
  salleCapacite?: number;
  enseignantNom?: string;
}

// New interfaces for automatic assignment
export interface AffectationEnseignantRequest {
  moduleId: number;
  moduleLibelle: string;
  groupeId: number;
  salleId: number;
  date: string; // YYYY-MM-DD format
  heureDebut: string; // HH:mm format
  heureFin: string; // HH:mm format
  typeExamen: string;
}

export interface AffectationSalleRequest {
  moduleId: number;
  groupeId: number;
  effectifGroupe: number;
  date: string;
  heureDebut: string;
  heureFin: string;
  periode: string;
}

@Injectable({
  providedIn: 'root'
})
export class AffectationService {
  private apiUrl = 'http://localhost:8090/affectations';
  private enseignantAutoApiUrl = 'http://localhost:8090/enseignants/auto-affectation';
  private emploiApiUrl = 'http://localhost:8090/emplois';
  private pdfApiUrl = 'http://localhost:8090/pdf';

  constructor(private http: HttpClient) {}

  affecterModuleAGroupes(request: AffectationRequestDTO): Observable<string> {
    return this.http.post(this.apiUrl + '/affecter', request, { responseType: 'text' });
  }

  getAllAffectations(): Observable<AffectationModuleGroupe[]> {
    return this.http.get<AffectationModuleGroupe[]>(this.apiUrl + '/all');
  }

  deleteAffectation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getModulesByPeriode(periode: string): Observable<MyModule[]> {
    return this.http.get<MyModule[]>(`${this.apiUrl}/modules-by-periode`, {
      params: { periode }
    });
  }

  // Récupérer les groupes par module et période
  getGroupesByModuleAndPeriode(moduleId: number, periode: string): Observable<Groupe[]> {
    return this.http.get<Groupe[]>(`${this.apiUrl}/groupes-by-module-and-periode`, {
      params: {
        moduleId: moduleId.toString(),
        periode
      }
    });
  }

  // New methods for automatic assignment integration
  
  /**
   * Automatic teacher assignment
   */
  affecterEnseignantAutomatiquement(request: AffectationEnseignantRequest): Observable<any> {
    return this.http.post(`${this.enseignantAutoApiUrl}/affecter`, request);
  }

  /**
   * Find optimal teacher for a module
   */
  findOptimalEnseignant(moduleId: number, moduleLibelle: string, date: string, heureDebut: string, heureFin: string): Observable<any> {
    return this.http.get(`${this.enseignantAutoApiUrl}/optimal`, {
      params: {
        moduleId: moduleId.toString(),
        moduleLibelle,
        date,
        heureDebut,
        heureFin
      }
    });
  }

  /**
   * Check teacher availability
   */
  checkEnseignantDisponibilite(enseignantId: number, date: string, heureDebut: string, heureFin: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.enseignantAutoApiUrl}/disponibilite/${enseignantId}`, {
      params: { date, heureDebut, heureFin }
    });
  }

  /**
   * Get assignment statistics
   */
  getAffectationStats(date: string): Observable<any> {
    return this.http.get(`${this.enseignantAutoApiUrl}/stats`, {
      params: { date }
    });
  }

  /**
   * Get all emploi du temps entries
   */
  getAllEmplois(): Observable<any[]> {
    return this.http.get<any[]>(`${this.emploiApiUrl}/all`);
  }

  /**
   * Get emplois by teacher
   */
  getEmploisByEnseignant(enseignantId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.emploiApiUrl}/enseignant/${enseignantId}`);
  }

  /**
   * Get emplois by date
   */
  getEmploisByDate(date: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.emploiApiUrl}/date`, {
      params: { date }
    });
  }

  // PDF Generation methods
  
  /**
   * Generate teacher planning PDF
   */
  generateEnseignantPlanningPDF(enseignantId: number, date: string): Observable<Blob> {
    return this.http.get(`${this.pdfApiUrl}/enseignant/${enseignantId}/planning`, {
      params: { date },
      responseType: 'blob'
    });
  }

  /**
   * Generate daily planning PDF
   */
  generateDailyPlanningPDF(date: string): Observable<Blob> {
    return this.http.get(`${this.pdfApiUrl}/planning-quotidien`, {
      params: { date },
      responseType: 'blob'
    });
  }

  /**
   * Generate comprehensive report PDF
   */
  generateComprehensiveReportPDF(dateDebut: string, dateFin: string): Observable<Blob> {
    return this.http.get(`${this.pdfApiUrl}/rapport-complet`, {
      params: { dateDebut, dateFin },
      responseType: 'blob'
    });
  }

  /**
   * Generate monthly teacher report PDF
   */
  generateMonthlyEnseignantReport(enseignantId: number, annee: number, mois: number): Observable<Blob> {
    return this.http.get(`${this.pdfApiUrl}/enseignant/${enseignantId}/rapport-mensuel`, {
      params: { 
        annee: annee.toString(), 
        mois: mois.toString() 
      },
      responseType: 'blob'
    });
  }

  /**
   * Download PDF file helper
   */
  downloadPDF(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}
