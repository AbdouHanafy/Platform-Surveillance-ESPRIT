import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EmploiDuTemps, EmploiDuTempsService, Groupe } from '../../../Service/emploi-du-temps.service';
import { CommonModule } from '@angular/common';
import { EnseignantService } from '../../../Service/enseignant-service.service';

@Component({
  selector: 'app-calendrier-emploi',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendrier-emploi-component.component.html',
  styleUrls: ['./calendrier-emploi-component.component.scss'],
})
export class CalendrierEmploiComponentComponent implements OnInit {
 jours: Date[] = [];
  heures: string[] = [];
  dateSelectionnee: string = '';
  
  // Données d'emploi du temps récupérées du service
  emploiDuTempsData: EmploiDuTemps[] = [];
  groupes: Groupe[] = [];
  enseignants: any[] = [];
  
  // ID de l'enseignant sélectionné (vous pouvez l'adapter selon vos besoins)
  enseignantSelectionne: number | null = null;

  constructor(
    private emploiService: EmploiDuTempsService,
    private enseignantService: EnseignantService
  ) { }

  ngOnInit(): void {
    this.initialiserHeures();
    this.initialiserJours(new Date()); // Initialise avec la date actuelle
    this.dateSelectionnee = new Date().toISOString().split('T')[0];
    
    // Charger les données de base
    this.loadGroupes();
    this.loadEnseignants();
    
    // Charger les emplois du temps (vous pouvez adapter selon vos besoins)
    this.loadEmploisDuTemps();
  }

  initialiserHeures(): void {
    for (let i = 8; i < 18; i++) { // De 8h à 17h
      this.heures.push(`${i < 10 ? '0' + i : i}:00`);
    }
  }

  initialiserJours(startDate: Date): void {
    this.jours = [];
    for (let i = 0; i < 7; i++) { // Affiche 7 jours à partir de la date sélectionnée
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      this.jours.push(day);
    }
  }

  loadGroupes(): void {
    this.emploiService.getAllGroupes().subscribe({
      next: (groupes) => {
        this.groupes = groupes;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des groupes:', error);
      }
    });
  }

  loadEnseignants(): void {
    this.emploiService.getAll().subscribe({
      next: (enseignants) => {
        this.enseignants = enseignants;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des enseignants:', error);
      }
    });
  }

  loadEmploisDuTemps(): void {
    // Charger tous les emplois du temps ou filtrer selon vos besoins
    // Ici, je charge les emplois filtrés par date
    this.emploiService.getEmploisFiltres(
      this.enseignantSelectionne, 
      null, 
      this.dateSelectionnee
    ).subscribe({
      next: (emplois) => {
        this.emploiDuTempsData = emplois;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des emplois du temps:', error);
      }
    });
  }

  onChangeDateFilter(event: Event): void {
    const inputDate = (event.target as HTMLInputElement).value;
    this.dateSelectionnee = inputDate;
    this.initialiserJours(new Date(inputDate));
    this.loadEmploisDuTemps(); // Recharger les emplois du temps pour la nouvelle date
  }

  // Fonction pour vérifier si une cellule est occupée
  estOccupe(heureCellule: string, dayIndex: number): boolean {
    const jourCellule = this.jours[dayIndex];
    if (!jourCellule) return false;

    const dateCellule = jourCellule.toISOString().split('T')[0];

    for (const event of this.emploiDuTempsData) {
      if (event.date === dateCellule) {
        const [eventHeureDebutStr, eventMinuteDebutStr] = event.heureDebut.split(':').map(Number);
        const [eventHeureFinStr, eventMinuteFinStr] = event.heureFin.split(':').map(Number);
        const [cellHeureStr, cellMinuteStr] = heureCellule.split(':').map(Number);

        const eventDebutMinutes = eventHeureDebutStr * 60 + eventMinuteDebutStr;
        const eventFinMinutes = eventHeureFinStr * 60 + eventMinuteFinStr;
        const cellDebutMinutes = cellHeureStr * 60 + cellMinuteStr;
        const cellFinMinutes = cellDebutMinutes + 60; // Chaque cellule représente une heure

        // Vérifie si l'événement chevauche la cellule d'une heure
        // Cette logique corrige le problème d'affichage de la durée
        if (Math.max(eventDebutMinutes, cellDebutMinutes) < Math.min(eventFinMinutes, cellFinMinutes)) {
          return true;
        }
      }
    }
    return false;
  }

  getActivite(heureCellule: string, dayIndex: number): string {
    return this.getEventInfo(heureCellule, dayIndex, 'typeActivite');
  }

  getSalle(heureCellule: string, dayIndex: number): string {
    return this.getEventInfo(heureCellule, dayIndex, 'salle');
  }

  getGroupe(heureCellule: string, dayIndex: number): string {
    const groupeId = this.getEventInfo(heureCellule, dayIndex, 'groupeId');
    if (groupeId) {
      const groupe = this.groupes.find(g => g.id.toString() === groupeId);
      return groupe ? groupe.nomClasse : groupeId;
    }
    return '';
  }

  private getEventInfo(heureCellule: string, dayIndex: number, infoType: keyof EmploiDuTemps): string {
    const jourCellule = this.jours[dayIndex];
    if (!jourCellule) return '';

    const dateCellule = jourCellule.toISOString().split('T')[0];

    for (const event of this.emploiDuTempsData) {
      if (event.date === dateCellule) {
        const [eventHeureDebutStr, eventMinuteDebutStr] = event.heureDebut.split(':').map(Number);
        const [eventHeureFinStr, eventMinuteFinStr] = event.heureFin.split(':').map(Number);
        const [cellHeureStr, cellMinuteStr] = heureCellule.split(':').map(Number);

        const eventDebutMinutes = eventHeureDebutStr * 60 + eventMinuteDebutStr;
        const eventFinMinutes = eventHeureFinStr * 60 + eventMinuteFinStr;
        const cellDebutMinutes = cellHeureStr * 60 + cellMinuteStr;
        const cellFinMinutes = cellDebutMinutes + 60; // Chaque cellule représente une heure

        // Vérifie si l'événement chevauche la cellule d'une heure
        if (Math.max(eventDebutMinutes, cellDebutMinutes) < Math.min(eventFinMinutes, cellFinMinutes)) {
          return event[infoType]?.toString() || '';
        }
      }
    }
    return '';
  }

  // Méthode pour sélectionner un enseignant (optionnelle)
  onEnseignantSelected(enseignantId: number): void {
    this.enseignantSelectionne = enseignantId;
    this.loadEmploisDuTemps();
  }

  // Méthode pour obtenir le nom de l'enseignant
  getEnseignantName(enseignantId: number): string {
    const enseignant = this.enseignants.find(e => e.id === enseignantId);
    return enseignant ? `${enseignant.nom} ${enseignant.prenom}` : 'Inconnu';
  }
}
