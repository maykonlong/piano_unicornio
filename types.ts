export type NoteName = 
  | 'C3' | 'C#3' | 'D3' | 'D#3' | 'E3' | 'F3' | 'F#3' | 'G3' | 'G#3' | 'A3' | 'A#3' | 'B3'
  | 'C4' | 'C#4' | 'D4' | 'D#4' | 'E4' | 'F4' | 'F#4' | 'G4' | 'G#4' | 'A4' | 'A#4' | 'B4'
  | 'C5';

export interface NoteDef {
  name: NoteName;
  freq: number;
  type: 'white' | 'black';
  label: string;
  color?: string; // For visualization
}

export enum GameMode {
  MENU = 'MENU',
  FREE_PLAY = 'FREE_PLAY',
  CHALLENGE = 'CHALLENGE',
  LEARN = 'LEARN',
  SETTINGS = 'SETTINGS',
  MAGIC_SHOW = 'MAGIC_SHOW',
}

export interface Song {
  id: string;
  title: string;
  difficulty: 'Fácil' | 'Médio' | 'Difícil';
  notes: { note: NoteName; time: number; duration: number }[];
  description?: string;
}

export interface RecordedNote {
  note: NoteName;
  timestamp: number;
}

export enum InstrumentType {
  PIANO = 'piano',
  XYLOPHONE = 'xylophone',
  SYNTH = 'synth'
}