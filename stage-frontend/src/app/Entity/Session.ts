export interface Session {
    id?: number;
    nom_session: string;
    dateDebut?: string; // ISO date string
    dateFin?: string;   // ISO date string
    periode?: 'PERIODE_1' | 'PERIODE_2' | 'PERIODE_3' | 'PERIODE_4';
    typeSession?: 'NORMALE' | 'RATTRAPAGE';
    moduleIds?: number[];
}
