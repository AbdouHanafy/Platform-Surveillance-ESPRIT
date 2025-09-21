export class Salle {
    id!: number;
    nom: string = '';
    capacite: string = '';
    bloc: string = '';
    etage: string = '';
    estReservee: boolean = false;  // <- correspond au backend
    status: string = '';            // optionnel, à remplir selon estReservee
}
