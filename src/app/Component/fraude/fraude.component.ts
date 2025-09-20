import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Fraude, FraudeRequestDTO, FraudeService } from '../../Service/fraude.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-fraude',
  templateUrl: './fraude.component.html',
  imports: [CommonModule,ReactiveFormsModule,FormsModule],
  styleUrls: ['./fraude.component.scss']
})
export class FraudeComponent implements OnInit {
  fraudeForm: FormGroup;
  fraudes: Fraude[] = [];
  submitted = false;
  filtreStatut: string = 'TOUS';
  currentUser: any;
  showTypeInput = false;
  typeOptions = ['Copie', 'Plagiat', 'Tricherie', 'Autre'];

  constructor(private fb: FormBuilder, private fraudeService: FraudeService) {
    this.fraudeForm = this.fb.group({
      nomEtudiant: ['', Validators.required],
      matricule: ['', Validators.required],
      nomEnseignant: ['', Validators.required],
      matriculeEnseignant: ['', Validators.required],
      groupeNom: ['', Validators.required],
      groupeId: [null, Validators.required],
      type: ['', Validators.required],
      autreType: [''],
      description: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.currentUser = {
      id: +(localStorage.getItem('id') || '0'),
      matricule: localStorage.getItem('matricule'),
      role: localStorage.getItem('role')
    };
    this.loadFraudes();

    this.fraudeForm.get('type')?.valueChanges.subscribe(value => {
      this.showTypeInput = value === 'Autre';
      if (!this.showTypeInput) {
        this.fraudeForm.get('autreType')?.setValue('');
      }
    });
  }

 loadFraudes() {
  this.fraudeService.getFraudes(this.filtreStatut).subscribe(data => {
    if (this.currentUser.role === 'SUPER_ADMIN' || this.currentUser.role === 'ADMIN') {
      this.fraudes = data; // voit tout
    } else {
      // Enseignant : voit seulement superadmin/admin + ses propres fraudes
      this.fraudes = data.filter(f => 
        f.roleEnseignant === 'SUPER_ADMIN' || f.roleEnseignant === 'ADMIN' || f.enseignantId === this.currentUser.id
      );
    }
  });
}

  onSubmit() {
    this.submitted = true;
    if (this.fraudeForm.invalid) return;

const dto: FraudeRequestDTO = {
  nomEtudiant: this.fraudeForm.value.nomEtudiant,
  matricule: this.fraudeForm.value.matricule,
  nomEnseignant: this.fraudeForm.value.nomEnseignant,
  matriculeEnseignant: this.fraudeForm.value.matriculeEnseignant,
  nomGroupe: this.fraudeForm.value.groupeNom, // correspond au DTO Java
  groupeId: this.fraudeForm.value.groupeId,
  type: this.showTypeInput ? this.fraudeForm.value.autreType : this.fraudeForm.value.type,
  description: this.fraudeForm.value.description
};
  

    this.fraudeService.declareFraude(dto).subscribe(() => {
      alert('Fraude déclarée avec succès !');
      this.fraudeForm.reset();
      this.submitted = false;
      this.loadFraudes();
    });
  }

  filtrerFraudes() {
    this.loadFraudes();
  }

  traiterFraude(f: Fraude) {
    const rapport = prompt('Entrez le rapport :');
    if (rapport) {
      this.fraudeService.traiterFraude(f.id, rapport).subscribe(() => this.loadFraudes());
    }
  }

  archiverFraude(f: Fraude) {
    if (confirm('Archiver cette fraude ?')) {
      this.fraudeService.archiverFraude(f.id).subscribe(() => this.loadFraudes());
    }
  }

  // Génère un modèle de lettre (.doc) pré-rempli pour la fraude sélectionnée
  async downloadLettreFraude(f: Fraude) {
    const logoDataUrl = await this.loadLogoAsDataUrl('assets/img/logo.png');
    const html = this.buildLettreHtml(f, logoDataUrl || undefined);
    const blob = new Blob(['\ufeff', html], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeStudent = (f.nomEtudiant || 'etudiant').replace(/[^a-z0-9_\-]/gi, '_');
    link.href = url;
    link.download = `lettre_fraude_${safeStudent}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Génère un PDF professionnel de la déclaration
  async downloadLettreFraudePdf(f: Fraude) {
    try {
      await this.ensurePdfMakeLoaded();
      const pdfMake: any = (window as any).pdfMake;
      const logo = await this.loadLogoAsDataUrl('assets/img/logo.png');
      const today = new Date();
      const dateStr = today.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
      const ref = `REF-${(f as any).id || 'XXXX'}/${today.getFullYear()}`;

      const docDefinition = {
        pageSize: 'A4',
        pageMargins: [40, 52, 40, 48],
        defaultStyle: { font: 'Roboto', fontSize: 12, lineHeight: 1.3 },
        styles: {
          org: { bold: true, fontSize: 13, color: '#111827' },
          orgSub: { fontSize: 10, color: '#6b7280' },
          title: { fontSize: 18, bold: true, color: '#b91c1c', alignment: 'center', margin: [0, 18, 0, 6] },
          subject: { fontSize: 12, bold: true, color: '#374151', alignment: 'center', margin: [0, 0, 0, 14] },
          label: { bold: true, color: '#374151', margin: [0, 10, 0, 4] },
          value: { color: '#111827', bold: true },
          muted: { color: '#6b7280', fontSize: 10 },
          section: { margin: [0, 8, 0, 0] }
        },
        content: [
          {
            columns: [
              logo ? { image: logo, width: 64, margin: [0, 0, 10, 0] } : { text: '' },
              [
                { text: "ESPRIT - École Supérieure Privée d'Ingénierie et de Technologies", style: 'org' },
                { text: 'Pôle universitaire - Tunis | Tél: +216 70 250 000 | esprit.tn', style: 'orgSub' }
              ]
            ],
            columnGap: 10,
            margin: [0, 0, 0, 10]
          },
          { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#e5e7eb' }] },
          {
            columns: [
              { text: `Réf.: ${ref}`, style: 'muted', margin: [0, 8, 0, 0] },
              { text: `Date: ${dateStr}`, style: 'muted', margin: [0, 8, 0, 0], alignment: 'right' }
            ]
          },
          { text: 'Déclaration de Fraude', style: 'title' },
          { text: `Déclaration de fraude – ${(f as any).type || ''}`, style: 'subject' },
          { text: "À l'attention de : Service disciplinaire", margin: [0, 4, 0, 0] },
          { text: 'Copie : Direction des études', style: 'muted', margin: [0, 0, 0, 10] },

          // Bloc Étudiant
          { style: 'label', text: 'Informations Étudiant' },
          {
            columns: [
              { width: '*', stack: [ { text: 'Étudiant', style: 'muted' }, { text: f.nomEtudiant || '', style: 'value', margin: [0, 2, 0, 8] } ] },
              { width: '*', stack: [ { text: 'Matricule Étudiant', style: 'muted' }, { text: (f as any).matricule || '', style: 'value', margin: [0, 2, 0, 8] } ] }
            ],
            columnGap: 24
          },
          {
            columns: [
              { width: '*', stack: [ { text: 'Classe / Groupe', style: 'muted' }, { text: f.nomGroupe || '', style: 'value', margin: [0, 2, 0, 8] } ] },
              { width: '*', stack: [ { text: 'N° Groupe', style: 'muted' }, { text: String((f as any).groupeId ?? ''), style: 'value', margin: [0, 2, 0, 8] } ] }
            ],
            columnGap: 24
          },

          // Bloc Enseignant
          { style: 'label', text: 'Informations Enseignant' },
          {
            columns: [
              { width: '*', stack: [ { text: 'Enseignant déclarant', style: 'muted' }, { text: (f as any).nomEnseignant || '', style: 'value', margin: [0, 2, 0, 8] } ] },
              { width: '*', stack: [ { text: 'Matricule enseignant', style: 'muted' }, { text: f.matriculeEnseignant || '', style: 'value', margin: [0, 2, 0, 8] } ] }
            ],
            columnGap: 24
          },
          {
            columns: [
              { width: '*', stack: [ { text: 'Rôle enseignant', style: 'muted' }, { text: (f as any).roleEnseignant || '', style: 'value', margin: [0, 2, 0, 8] } ] },
              { width: '*', text: '' }
            ],
            columnGap: 24,
            margin: [0, 0, 0, 6]
          },

          // Type et description
          { style: 'label', text: 'Type de fraude' },
          { text: f.type || '', margin: [0, 2, 0, 10] },
          { style: 'label', text: 'Description / Constat' },
          { text: f.description || '', margin: [0, 2, 0, 16] },

          { text: "Nous vous prions de bien vouloir prendre connaissance de la présente déclaration et d'engager les suites nécessaires conformément au règlement intérieur.", style: 'muted', margin: [0, 0, 0, 18] },

          {
            columns: [
              { width: '*', stack: [ { text: "Signature de l'enseignant", style: 'label' }, { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 220, y2: 0, lineWidth: 1, lineColor: '#e5e7eb' }] }, { text: 'Nom et signature', style: 'muted', margin: [0, 6, 0, 0] } ] },
              { width: '*', stack: [ { text: "Visa de l'administration", style: 'label' }, { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 220, y2: 0, lineWidth: 1, lineColor: '#e5e7eb' }] }, { text: 'Nom et cachet', style: 'muted', margin: [0, 6, 0, 0] } ] }
            ],
            columnGap: 24
          },

          { text: 'Document généré automatiquement — Plateforme de Surveillance des Examens', style: 'muted', alignment: 'center', margin: [0, 24, 0, 0] }
        ]
      } as any;

      // Generate and download the PDF
      const pdfDoc = pdfMake.createPdf(docDefinition);
      const fileName = `lettre_fraude_${(f.nomEtudiant || 'etudiant').replace(/[^a-z0-9_\-]/gi, '_')}.pdf`;
      
      pdfDoc.download(fileName);
      
      console.log('PDF generated successfully:', fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Erreur lors de la génération du PDF. Veuillez réessayer.');
    }
  }

  private async ensurePdfMakeLoaded(): Promise<void> {
    const w = window as any;
    if (w.pdfMake && w.pdfMake.vfs) return;
    await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.10/pdfmake.min.js');
    await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.10/vfs_fonts.js');
  }

  private loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error('Failed to load ' + src));
      document.body.appendChild(s);
    });
  }

  private async loadLogoAsDataUrl(path: string): Promise<string | null> {
    try {
      const res = await fetch(path, { cache: 'no-store' });
      if (!res.ok) return null;
      const blob = await res.blob();
      return await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    } catch {
      return null;
    }
  }

  private buildLettreHtml(f: Fraude, logoDataUrl?: string): string {
    const today = new Date();
    const dateStr = today.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
    const ref = `REF-${(f as any).id || 'XXXX'}/${today.getFullYear()}`;
    const logo = logoDataUrl || 'assets/img/logo.png';
    const subject = `Déclaration de fraude – ${this.escape(f.type)}`;
    return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <title>Lettre de déclaration de fraude</title>
  <style>
    @page { size: A4; margin: 22mm 18mm; }
    body { font-family: Arial, Helvetica, sans-serif; color: #111827; line-height: 1.6; font-size: 12.5px; }
    .letter { max-width: 700px; margin: 0 auto; }
    .letterhead { display: flex; align-items: center; gap: 16px; padding-bottom: 10px; border-bottom: 2px solid #e5e7eb; }
    .logo { height: 54px; }
    .org { font-weight: 700; font-size: 16px; color: #111827; }
    .org-sub { color: #6b7280; font-size: 12px; }
    .ref-date { display: flex; justify-content: space-between; margin-top: 12px; color: #6b7280; }
    .title { text-align: center; font-size: 20px; font-weight: 800; margin: 20px 0 10px; color: #b91c1c; letter-spacing: .3px; }
    .subject { text-align: center; font-weight: 600; color: #374151; margin-bottom: 18px; }
    .meta { margin: 14px 0; font-size: 13px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; }
    .key { color: #6b7280; }
    .val { color: #111827; font-weight: 600; }
    .box { border: 1px solid #e5e7eb; padding: 12px; border-radius: 8px; background: #ffffff; }
    .section { margin-top: 16px; }
    .section .label { display: block; font-weight: 700; margin-bottom: 6px; color: #374151; }
    .signature { margin-top: 36px; display: flex; justify-content: space-between; gap: 24px; }
    .sig { width: 48%; }
    .sig .line { margin-top: 42px; height: 1px; background: #e5e7eb; }
    .muted { color: #6b7280; font-size: 12px; }
    .footer { margin-top: 26px; padding-top: 10px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 11px; text-align: center; }
    .to { margin-top: 14px; }
    .to strong { color: #374151; }
    .body { margin-top: 12px; }
  </style>
  </head>
  <body>
    <div class="letter">
      <div class="letterhead">
        <img class="logo" src="${logo}" alt="Logo"/>
        <div>
          <div class="org">ESPRIT - École Supérieure Privée d'Ingénierie et de Technologies</div>
          <div class="org-sub">Pôle universitaire - Tunis | Tél: +216 70 250 000 | esprit.tn</div>
        </div>
      </div>

      <div class="ref-date">
        <div><strong>Réf.:</strong> ${this.escape(ref)}</div>
        <div><strong>Date:</strong> ${this.escape(dateStr)}</div>
      </div>

      <div class="title">Déclaration de Fraude</div>
      <div class="subject">${this.escape(subject)}</div>

      <div class="to">
        <div><strong>À l'attention de</strong> : Service disciplinaire</div>
        <div class="muted">Copie : Direction des études</div>
      </div>

      <div class="meta grid">
        <div><span class="key">Étudiant</span><br/><span class="val">${this.escape(f.nomEtudiant)}</span></div>
        <div><span class="key">Matricule Étudiant</span><br/><span class="val">${this.escape((f as any).matricule || '')}</span></div>
        <div><span class="key">Classe</span><br/><span class="val">${this.escape(f.nomGroupe)}</span></div>
        <div><span class="key">N° Classe</span><br/><span class="val">${this.escape(String(f.groupeId))}</span></div>
      </div>

      <div class="meta grid">
        <div><span class="key">Enseignant déclarant</span><br/><span class="val">${this.escape((f as any).nomEnseignant || '')}</span></div>
        <div><span class="key">Matricule enseignant</span><br/><span class="val">${this.escape(f.matriculeEnseignant || '')}</span></div>
        <div><span class="key">Rôle enseignant</span><br/><span class="val">${this.escape((f as any).roleEnseignant || '')}</span></div>
        <div><span class="key">Statut</span><br/><span class="val">${this.escape((f as any).statut || '')}</span></div>
      </div>

      <div class="section">
        <span class="label">Type de fraude</span>
        <div class="box">${this.escape(f.type)}</div>
      </div>

      <div class="section">
        <span class="label">Description / Constat</span>
        <div class="box">${this.escape(f.description)}</div>
      </div>

      <div class="body muted">
        Nous vous prions de bien vouloir prendre connaissance de la présente déclaration et d'engager les suites nécessaires conformément au règlement intérieur.
      </div>

      <div class="section">
        <div class="muted">Cette déclaration est établie pour information et suites nécessaires par les services compétents.</div>
      </div>

      <div class="signature">
        <div class="sig">
          <div class="label">Signature de l'enseignant</div>
          <div class="line"></div>
          <div class="muted">Nom et signature</div>
        </div>
        <div class="sig">
          <div class="label">Visa de l'administration</div>
          <div class="line"></div>
          <div class="muted">Nom et cachet</div>
        </div>
      </div>

      <div class="footer">Document généré automatiquement — Plateforme de Surveillance des Examens</div>
    </div>
  </body>
  </html>`;
  }

  private escape(value: any): string {
    const str = String(value ?? '');
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}
