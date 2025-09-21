import { Component, OnInit } from '@angular/core';
import { EmploiDuTemps, EmploiDuTempsService } from '../../../Service/emploi-du-temps.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Enseignant } from '../../../Entity/Enseignant';
import { Router } from '@angular/router';

@Component({
  selector: 'app-emploi-du-temp',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './emploi-du-temp.component.html',
  styleUrls: ['./emploi-du-temp.component.scss']
})
export class EmploiDuTempComponent implements OnInit {

 enseignants: Enseignant[] = [];

  constructor(private EmploiDuTempsService: EmploiDuTempsService, private router: Router) {}

  ngOnInit(): void {
    this.EmploiDuTempsService.getAll().subscribe(data => this.enseignants = data);
  }

  ajouterEmploi(id: number) {
    this.router.navigate(['/addCalendrier', id]); 
  }

 voiremploi(enseignantId: number) {
  this.router.navigate(['/Calendrier_enseignant', enseignantId]); 
}

}