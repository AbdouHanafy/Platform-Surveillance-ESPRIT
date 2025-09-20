import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SessionServiceService } from '../../Service/session-service.service';
import { Session } from '../../Entity/Session';

@Component({
  selector: 'app-session-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './session-manager.component.html',
  styleUrl: './session-manager.component.scss'
})
export class SessionManagerComponent implements OnInit {
  sessions: Session[] = [];
  newSession: Session = { nom_session: '' };
  editingSession: Session | null = null;
  showForm = false;

  constructor(private sessionService: SessionServiceService) {}

  ngOnInit(): void {
    this.loadSessions();
  }

  get editing(): boolean {
    return this.editingSession !== null;
  }

  get sessionModel(): Session {
    return this.editingSession ?? this.newSession;
  }

  loadSessions(): void {
    this.sessionService.getAll().subscribe((data) => (this.sessions = data));
  }

  saveSession(): void {
    const sessionToSave = this.editingSession ?? this.newSession;
    this.sessionService[this.editing ? 'update' : 'add'](sessionToSave).subscribe(() => {
      this.editingSession = null;
      this.newSession = { nom_session: '' };
      this.showForm = false;
      this.loadSessions();
    });
  }

  editSession(session: Session): void {
    this.editingSession = { ...session };
    this.showForm = true;
  }

  deleteSession(id?: number): void {
    if (id != null && confirm('Voulez-vous vraiment supprimer cette session ?')) {
      this.sessionService.delete(id).subscribe(() => this.loadSessions());
    }
  }

  cancelEdit(): void {
    this.editingSession = null;
    this.newSession = { nom_session: '' };
    this.showForm = false;
  }

  openAddForm(): void {
    this.editingSession = null;
    this.newSession = { nom_session: '' };
    this.showForm = true;
  }

  closeForm(): void {
    this.cancelEdit();
  }

  trackBySessionId(index: number, session: Session): any {
    return session.id || index;
  }
}