import { MyModule } from "./module.model";
import { UnitePedagogique } from "./unite-pedagogique.model";

export interface EnseignantAvecModules {
  id: number;
  nom: string;
  unitePedagogique?: UnitePedagogique; 
  modules: MyModule[];
}
        