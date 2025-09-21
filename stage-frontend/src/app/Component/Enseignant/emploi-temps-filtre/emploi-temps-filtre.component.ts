import { Component, OnInit } from '@angular/core';
import { EmploiDuTemps, EmploiDuTempsService, Groupe } from '../../../Service/emploi-du-temps.service';
import { Enseignant } from '../../../Entity/Enseignant';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface CalendarCell {
  heure: string;
  day: number;
  emploi?: EmploiDuTemps;
  estOccupe: boolean;
}

interface FiltersState {
  selectedDate: string;
  selectedEnseignantId: number | null;
  selectedGroupeId: number | null;
}

@Component({
  selector: 'app-emploi-temps-filtre',
  imports: [CommonModule],
  templateUrl: './emploi-temps-filtre.component.html',
  styleUrl: './emploi-temps-filtre.component.scss'
})


export class EmploiTempsFiltreComponent implements OnInit {

emploi: EmploiDuTemps[] = [];
  groupes: Groupe[] = [];
  enseignants: Enseignant[] = [];

  jours: Date[] = [];
  heures: string[] = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00','15:00', '16:00', '17:00', '18:00'];

  // Filtrage
  selectedDate!: string;
  selectedEnseignantId: number | null = null;
  selectedGroupeId: number | null = null;

  constructor(private emploiService: EmploiDuTempsService, private router:Router) {}

  ngOnInit(): void {
    const aujourdhui = new Date();
    this.selectedDate = aujourdhui.toISOString().substring(0, 10);

    // Charger groupes + enseignants, puis emplois
    this.emploiService.getAllGroupes().subscribe(data => this.groupes = data);
    this.emploiService.getAll().subscribe(data => this.enseignants = data);

    this.chargerEmploisEtSemaine(this.selectedDate);
  }

  chargerEmploisEtSemaine(dateStr: string) {
    const date = new Date(dateStr);
    const debutSemaine = this.getDateDebutSemaine(date);

    this.jours = [];
    for (let i = 0; i < 7; i++) {
      const jour = new Date(debutSemaine);
      jour.setDate(debutSemaine.getDate() + i);
      this.jours.push(jour);
    }

    // Appeler backend avec filtres
    this.emploiService.getEmploisFiltres(
      this.selectedEnseignantId,
      this.selectedGroupeId,
      this.selectedDate
    ).subscribe(data => {
      this.emploi = data;
    });
  }

  getDateDebutSemaine(date: Date): Date {
    const day = date.getDay();
    const diff = (day === 0 ? -6 : 1) - day;
    const debut = new Date(date);
    debut.setDate(date.getDate() + diff);
    debut.setHours(0, 0, 0, 0);
    return debut;
  }

  isSameDate(d1: Date, d2: Date): boolean {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  }

  estOccupe(heure: string, dayOffset: number): boolean {
    const dateAAfficher = this.jours[dayOffset];
    return this.emploi.some(e =>
      this.convertHeure(e.heureDebut) === heure &&
      this.isSameDate(new Date(e.date), dateAAfficher)
    );
  }

  getActivite(heure: string, dayOffset: number): string {
    const dateAAfficher = this.jours[dayOffset];
    const e = this.emploi.find(e =>
      this.convertHeure(e.heureDebut) === heure &&
      this.isSameDate(new Date(e.date), dateAAfficher)
    );
    return e?.typeActivite || '';
  }

  getSalle(heure: string, dayOffset: number): string {
    const dateAAfficher = this.jours[dayOffset];
    const e = this.emploi.find(e =>
      this.convertHeure(e.heureDebut) === heure &&
      this.isSameDate(new Date(e.date), dateAAfficher)
    );
    return e?.salle || '';
  }

  getNomGroupeById(groupeId: number): string {
    const groupe = this.groupes.find(g => g.id === groupeId);
    return groupe ? groupe.nomClasse : '';
  }

  getGroupe(heure: string, dayOffset: number): string {
    const dateAAfficher = this.jours[dayOffset];
    const e = this.emploi.find(e =>
      this.convertHeure(e.heureDebut) === heure &&
      this.isSameDate(new Date(e.date), dateAAfficher)
    );
    if (e) {
      return this.getNomGroupeById(e.groupeId);
    }
    return '';
  }

  convertHeure(heure: string): string {
    return heure?.toString().substring(0, 5);
  }

  // Handlers pour filtres
  onChangeDateFilter(event: any) {
    this.selectedDate = event.target.value;
    this.chargerEmploisEtSemaine(this.selectedDate);
  }

  onChangeEnseignant(event: any) {
    const val = event.target.value;
    this.selectedEnseignantId = val ? +val : null;
    this.chargerEmploisEtSemaine(this.selectedDate);
  }

  onChangeGroupe(event: any) {
    const val = event.target.value;
    this.selectedGroupeId = val ? +val : null;
    this.chargerEmploisEtSemaine(this.selectedDate);
  }
    navigateToAjouterEmploidutemps() {
  this.router.navigate(['addCalendrier/{{id}}']);
}
}