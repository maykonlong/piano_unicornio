import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Piano } from '../components/Piano';
import { Song, NoteName } from '../types';
import { SAMPLE_SONGS, PIANO_NOTES } from '../constants';
import { generateKidsSong } from '../services/geminiService';

interface ChallengeProps {
  onBack: () => void;
}

export const Challenge: React.FC<ChallengeProps> = ({ onBack }) => {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [gameState, setGameState] = useState<'SELECT' | 'PLAYING' | 'WON'>('SELECT');
  const [score, setScore] = useState(0);
  const [activeNotes, setActiveNotes] = useState<{id: number, note: NoteName, y: number, hit: boolean}[]>([]);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // We only show the first 15 songs as "Challenges" as requested (the easier ones mostly)
  const CHALLENGE_SONGS = SAMPLE_SONGS.slice(0, 15);

  const requestRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const noteIndexRef = useRef<number>(0);

  const updateGame = useCallback(() => {
    if (!currentSong || gameState !== 'PLAYING') return;

    const now = Date.now();
    const elapsedTime = now - startTimeRef.current;

    if (noteIndexRef.current < currentSong.notes.length) {
      const nextNote = currentSong.notes[noteIndexRef.current];
      if (elapsedTime >= nextNote.time) {
        setActiveNotes(prev => [...prev, { 
          id: Date.now() + Math.random(), 
          note: nextNote.note, 
          y: 0, 
          hit: false 
        }]);
        noteIndexRef.current++;
      }
    }

    setActiveNotes(prev => 
      prev.map(n => ({ ...n, y: n.y + 1.5 })) 
          .filter(n => n.y < 110)
    );

    if (noteIndexRef.current >= currentSong.notes.length && activeNotes.length === 0) {
      setGameState('WON');
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    } else {
      requestRef.current = requestAnimationFrame(updateGame);
    }
  }, [currentSong, gameState, activeNotes.length]);

  useEffect(() => {
    if (gameState === 'PLAYING') {
      startTimeRef.current = Date.now();
      noteIndexRef.current = 0;
      setActiveNotes([]);
      setScore(0);
      requestRef.current = requestAnimationFrame(updateGame);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameState, updateGame]);

  const handleNotePlay = (note: NoteName) => {
    if (gameState !== 'PLAYING') return;

    setActiveNotes(prev => {
      const hitIndex = prev.findIndex(n => 
        n.note === note && !n.hit && n.y > 60 && n.y < 95
      );

      if (hitIndex >= 0) {
        setScore(s => s + 10);
        const newNotes = [...prev];
        newNotes[hitIndex] = { ...newNotes[hitIndex], hit: true };
        return newNotes.filter((_, i) => i !== hitIndex);
      }
      return prev;
    });
  };

  const startSong = (song: Song) => {
    setCurrentSong(song);
    setGameState('PLAYING');
  };

  const handleGenerateSong = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    const newSong = await generateKidsSong(prompt);
    setIsGenerating(false);
    if (newSong) {
      startSong(newSong);
    } else {
      alert("Ops! As fadinhas não conseguiram ouvir. Tente de novo!");
    }
  };

  const getNotePosition = (noteName: NoteName) => {
    const totalKeys = PIANO_NOTES.length;
    const index = PIANO_NOTES.findIndex(n => n.name === noteName);
    if (index === -1) return 0;
    return (index / totalKeys) * 100;
  };

  return (
    <div className="flex flex-col h-full w-full bg-gradient-to-b from-unicorn-lilac to-unicorn-pink overflow-hidden relative">
      {/* Top HUD */}
      <div className="h-16 bg-white/30 backdrop-blur-md flex items-center justify-between px-4 z-20 shadow-sm border-b border-white/40">
        <button onClick={() => setGameState('SELECT')} className="text-pink-600 font-bold bg-white/80 px-4 py-2 rounded-full font-comic shadow-sm">
          {gameState === 'SELECT' ? <span onClick={onBack}>⬅️ Menu</span> : '⬅️ Voltar'}
        </button>
        {gameState === 'PLAYING' && (
           <div className="text-white drop-shadow-md font-bold text-2xl animate-pulse font-comic bg-pink-400 px-4 py-1 rounded-full">
             Coroas: {score/10} 👑
           </div>
        )}
        <div className="w-20"></div>
      </div>

      {/* Game Area */}
      {gameState === 'SELECT' ? (
        <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center">
          <h2 className="text-4xl text-white font-bold mb-8 font-comic drop-shadow-md">Escolha sua música mágica! (15 Desafios)</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl pb-8">
            {CHALLENGE_SONGS.map(song => (
              <button 
                key={song.id}
                onClick={() => startSong(song)}
                className="bg-white/90 p-6 rounded-3xl shadow-lg hover:scale-105 transition-transform text-left border-4 border-white group"
              >
                <h3 className="text-2xl font-bold text-pink-500 font-comic group-hover:text-unicorn-purple transition-colors">{song.title} 🦄</h3>
                <span className="inline-block bg-unicorn-blue text-white px-3 py-1 rounded-full text-sm mt-2 font-bold">{song.difficulty}</span>
              </button>
            ))}

            {/* AI Generator Card */}
            <div className="bg-gradient-to-br from-unicorn-purple to-pink-500 p-6 rounded-3xl shadow-xl text-white col-span-1 md:col-span-2 border-4 border-yellow-300">
               <h3 className="text-2xl font-bold mb-2 font-comic">✨ Fada Madrinha Compositora</h3>
               <p className="mb-4 opacity-90 font-comic">Sobre o que você quer cantar hoje?</p>
               <div className="flex gap-2">
                 <input 
                   type="text" 
                   value={prompt}
                   onChange={(e) => setPrompt(e.target.value)}
                   placeholder="Ex: Castelo de doces..."
                   className="flex-1 px-4 py-2 rounded-full text-purple-900 font-comic border-none outline-none focus:ring-4 ring-yellow-300"
                   onKeyDown={(e) => e.key === 'Enter' && handleGenerateSong()}
                 />
                 <button 
                   onClick={handleGenerateSong}
                   disabled={isGenerating}
                   className="bg-yellow-400 text-purple-900 font-bold px-6 py-2 rounded-full hover:bg-yellow-300 disabled:opacity-50 font-comic shadow-md"
                 >
                   {isGenerating ? 'Criando...' : 'Criar Mágica!'}
                 </button>
               </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 relative">
           {/* Falling Tiles Container */}
           <div className="absolute inset-0 pointer-events-none z-10">
             <div className="absolute bottom-[35%] w-full h-1 bg-white/40 border-t-2 border-dashed border-white/60"></div>
             
             {activeNotes.map(n => {
                const left = getNotePosition(n.note);
                return (
                  <div 
                    key={n.id}
                    className="absolute w-[3.5%] h-12 flex items-center justify-center text-3xl animate-float"
                    style={{ 
                      left: `${left}%`, 
                      top: `${n.y}%`,
                      opacity: n.hit ? 0 : 1,
                      transition: 'opacity 0.2s',
                    }}
                  >
                    💖
                  </div>
                );
             })}

             {gameState === 'WON' && (
               <div className="absolute inset-0 bg-pink-900/80 z-50 flex flex-col items-center justify-center animate-fade-in backdrop-blur-sm">
                 <h2 className="text-8xl mb-4 animate-bounce">👑</h2>
                 <h2 className="text-5xl text-white font-bold mb-4 font-comic drop-shadow-lg">Parabéns Princesa!</h2>
                 <p className="text-3xl text-yellow-300 mb-8 font-comic">Você brilhou muito! ✨</p>
                 <button 
                   onClick={() => setGameState('SELECT')}
                   className="bg-white text-pink-500 border-4 border-pink-500 px-10 py-4 rounded-full text-2xl font-bold hover:scale-110 transition-transform font-comic shadow-2xl"
                 >
                   Tocar Outra Vez
                 </button>
               </div>
             )}
             
             {showConfetti && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  {[...Array(30)].map((_, i) => (
                    <div 
                      key={i} 
                      className="absolute text-2xl animate-bounce"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `-20px`,
                        animationDuration: `${Math.random() * 2 + 1}s`,
                        animationDelay: `${Math.random()}s`
                      }}
                    >
                      {['⭐', '🌈', '🦄', '💖'][Math.floor(Math.random()*4)]}
                    </div>
                  ))}
                </div>
             )}
           </div>

           <div className="absolute bottom-0 w-full h-[35%] z-20">
             <Piano onNotePlay={handleNotePlay} disabled={gameState === 'WON'} />
           </div>
        </div>
      )}
    </div>
  );
};