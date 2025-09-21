import { User } from './User';
import { Enseignant } from './Enseignant';

export interface UserEnseignantDTO {
  user: User;
  enseignant: Enseignant;
}
