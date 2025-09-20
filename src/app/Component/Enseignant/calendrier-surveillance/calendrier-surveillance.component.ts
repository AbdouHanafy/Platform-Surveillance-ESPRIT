import { Component } from '@angular/core';
import { Enseignant } from '../../../Entity/Enseignant';
import { EmploiDuTempsService } from '../../../Service/emploi-du-temps.service';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-calendrier-surveillance',
   imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './calendrier-surveillance.component.html',
  styleUrl: './calendrier-surveillance.component.scss'
})
export class CalendrierSurveillanceComponent {

 enseignants: Enseignant[] = [];

  constructor(private EmploiDuTempsService: EmploiDuTempsService, private router: Router) {}

  ngOnInit(): void {
    this.EmploiDuTempsService.getAll().subscribe(data => this.enseignants = data);
  }


  ajouterEmploi(id: number) {
    this.router.navigate(['/add-surveillance', id]); 
  }
}
