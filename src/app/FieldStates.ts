interface FieldState {
  touched: boolean;
  valid: boolean;
}

interface FieldStates {
  username: FieldState;
  email: FieldState;
  password: FieldState;
  role: FieldState;
  resetEmail: FieldState;
  [key: string]: FieldState; 
}