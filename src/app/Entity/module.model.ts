import { UnitePedagogique } from "./unite-pedagogique.model";

export interface MyModule {
  id: number;

  codeModule: string;
  libelleModule: string;
 
  
   unitePedagogique: {
    id: number;
    libelle: string;
  };
}