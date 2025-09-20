export interface UserCreate {
  username: string;
  email: string;
  password: string;
  role: string;
  matricule: string;
  active?: boolean;
}
