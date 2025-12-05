import { NoteDef, NoteName } from './types';

// Frequencies for notes
const noteFrequencies: Record<NoteName, number> = {
  'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'D#3': 155.56, 'E3': 164.81, 'F3': 174.61, 'F#3': 185.00, 'G3': 196.00, 'G#3': 207.65, 'A3': 220.00, 'A#3': 233.08, 'B3': 246.94,
  'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88,
  'C5': 523.25
};

export const PIANO_NOTES: NoteDef[] = [
  { name: 'C3', freq: noteFrequencies['C3'], type: 'white', label: 'Dó' },
  { name: 'C#3', freq: noteFrequencies['C#3'], type: 'black', label: '' },
  { name: 'D3', freq: noteFrequencies['D3'], type: 'white', label: 'Ré' },
  { name: 'D#3', freq: noteFrequencies['D#3'], type: 'black', label: '' },
  { name: 'E3', freq: noteFrequencies['E3'], type: 'white', label: 'Mi' },
  { name: 'F3', freq: noteFrequencies['F3'], type: 'white', label: 'Fá' },
  { name: 'F#3', freq: noteFrequencies['F#3'], type: 'black', label: '' },
  { name: 'G3', freq: noteFrequencies['G3'], type: 'white', label: 'Sol' },
  { name: 'G#3', freq: noteFrequencies['G#3'], type: 'black', label: '' },
  { name: 'A3', freq: noteFrequencies['A3'], type: 'white', label: 'Lá' },
  { name: 'A#3', freq: noteFrequencies['A#3'], type: 'black', label: '' },
  { name: 'B3', freq: noteFrequencies['B3'], type: 'white', label: 'Si' },
  { name: 'C4', freq: noteFrequencies['C4'], type: 'white', label: 'Dó' },
  { name: 'C#4', freq: noteFrequencies['C#4'], type: 'black', label: '' },
  { name: 'D4', freq: noteFrequencies['D4'], type: 'white', label: 'Ré' },
  { name: 'D#4', freq: noteFrequencies['D#4'], type: 'black', label: '' },
  { name: 'E4', freq: noteFrequencies['E4'], type: 'white', label: 'Mi' },
  { name: 'F4', freq: noteFrequencies['F4'], type: 'white', label: 'Fá' },
  { name: 'F#4', freq: noteFrequencies['F#4'], type: 'black', label: '' },
  { name: 'G4', freq: noteFrequencies['G4'], type: 'white', label: 'Sol' },
  { name: 'G#4', freq: noteFrequencies['G#4'], type: 'black', label: '' },
  { name: 'A4', freq: noteFrequencies['A4'], type: 'white', label: 'Lá' },
  { name: 'A#4', freq: noteFrequencies['A#4'], type: 'black', label: '' },
  { name: 'B4', freq: noteFrequencies['B4'], type: 'white', label: 'Si' },
  { name: 'C5', freq: noteFrequencies['C5'], type: 'white', label: 'Dó' },
];

// Helper to create simple patterns
const createPattern = (notes: NoteName[], baseTime: number = 500) => {
  let currentTime = 0;
  return notes.map(n => {
    const noteObj = { note: n, time: currentTime, duration: baseTime };
    currentTime += baseTime;
    return noteObj;
  });
};

const basicSongs = [
  {
    id: 'twinkle',
    title: 'Twinkle Little Unicorn',
    difficulty: 'Fácil',
    notes: createPattern(['C4', 'C4', 'G4', 'G4', 'A4', 'A4', 'G4'])
  },
  {
    id: 'happy_birthday',
    title: 'Parabéns da Princesa',
    difficulty: 'Médio',
    notes: createPattern(['C4', 'C4', 'D4', 'C4', 'F4', 'E4'], 400)
  },
  {
    id: 'mary_lamb',
    title: 'O Cordeirinho Mágico',
    difficulty: 'Fácil',
    notes: createPattern(['E4', 'D4', 'C4', 'D4', 'E4', 'E4', 'E4'])
  },
  {
    id: 'jingle_bells',
    title: 'Sinos de Natal',
    difficulty: 'Fácil',
    notes: createPattern(['E4', 'E4', 'E4', 'E4', 'E4', 'E4', 'E4', 'G4', 'C4', 'D4', 'E4'], 300)
  },
  {
    id: 'baby_shark',
    title: 'Tubarãozinho',
    difficulty: 'Fácil',
    notes: createPattern(['D4', 'E4', 'G4', 'G4', 'G4', 'G4', 'G4', 'G4', 'D4', 'E4', 'G4'], 250)
  },
  {
    id: 'ode_joy',
    title: 'Hino da Alegria',
    difficulty: 'Médio',
    notes: createPattern(['E4', 'E4', 'F4', 'G4', 'G4', 'F4', 'E4', 'D4', 'C4', 'C4', 'D4', 'E4', 'E4', 'D4', 'D4'], 350)
  },
  {
    id: 'row_boat',
    title: 'Reme o Barquinho',
    difficulty: 'Fácil',
    notes: createPattern(['C4', 'C4', 'C4', 'D4', 'E4', 'E4', 'D4', 'E4', 'F4', 'G4'], 400)
  },
  {
    id: 'london_bridge',
    title: 'Ponte de Londres',
    difficulty: 'Médio',
    notes: createPattern(['G4', 'A4', 'G4', 'F4', 'E4', 'F4', 'G4', 'D4', 'E4', 'F4', 'E4', 'F4', 'G4'], 350)
  },
  {
    id: 'itsy_bitsy',
    title: 'A Dona Aranha',
    difficulty: 'Médio',
    notes: createPattern(['G3', 'C4', 'C4', 'C4', 'D4', 'E4', 'E4', 'E4', 'D4', 'C4', 'D4', 'E4', 'C4'], 300)
  },
  {
    id: 'old_macdonald',
    title: 'Sítio do Unicórnio',
    difficulty: 'Médio',
    notes: createPattern(['G4', 'G4', 'G4', 'D4', 'E4', 'E4', 'D4', 'B4', 'B4', 'A4', 'A4', 'G4'], 350)
  }
];

// Generate remixes to fill up to 30 songs
const remixes = basicSongs.flatMap(song => [
  {
    ...song,
    id: `${song.id}_remix`,
    title: `${song.title} Remix ⚡`,
    difficulty: 'Difícil',
    notes: song.notes.map(n => ({ ...n, duration: n.duration / 2, time: n.time / 1.5 }))
  },
  {
    ...song,
    id: `${song.id}_magic`,
    title: `${song.title} Mágico ✨`,
    difficulty: 'Médio',
    notes: song.notes.map((n, i) => ({ ...n, note: i % 2 === 0 ? n.note : 'C5' as NoteName })) // Add high notes for magic feel
  }
]);

export const SAMPLE_SONGS: any[] = [...basicSongs, ...remixes];
