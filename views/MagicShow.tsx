import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Piano } from '../components/Piano';
import { Song, NoteName } from '../types';
import { SAMPLE_SONGS, PIANO_NOTES } from '../constants';
import { soundEngine } from '../services/soundEngine';

interface MagicShowProps {
  onBack: () => void;
}

interface HighScore {
  score: number;
  date: number;
}

export const MagicShow: React.FC<MagicShowProps> = ({ onBack }) => {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [gameState, setGameState] = useState<'SELECT' | 'READY' | 'PLAYING' | 'WON'>('SELECT');
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [health, setHealth] = useState(50); // 0 to 100
  const [activeNotes, setActiveNotes] = useState<{id: number, note: NoteName, y: number, hit: boolean, type: 'star' | 'diamond'}[]>([]);
  const [hitEffects, setHitEffects] = useState<{id: number, note: NoteName, timestamp: number}[]>([]);
  const [feedback, setFeedback] = useState<{text: string, scale: number} | null>(null);
  const [showFever, setShowFever] = useState(false);
  const [highScores, setHighScores] = useState<Record<string, HighScore[]>>({});

  const requestRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const noteIndexRef = useRef<number>(0);

  // Arcade Settings
  const NOTE_SPEED = 0.75; // Optimized for mobile reading speed
  const HIT_ZONE_Y = 82; 
  const HIT_WINDOW = 12;
  
  const currentMultiplier = Math.floor(combo / 10) + 1;

  // Load High Scores on Mount
  useEffect(() => {
    const loadedScores: Record<string, HighScore[]> = {};
    SAMPLE_SONGS.forEach(song => {
      const saved = localStorage.getItem(`magic_score_${song.id}`);
      if (saved) {
        loadedScores[song.id] = JSON.parse(saved);
      }
    });
    setHighScores(loadedScores);
  }, []);

  const saveScore = (songId: string, newScore: number) => {
    const existing = highScores[songId] || [];
    const newEntry = { score: newScore, date: Date.now() };
    const updated = [...existing, newEntry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 3); // Keep top 3

    localStorage.setItem(`magic_score_${songId}`, JSON.stringify(updated));
    setHighScores(prev => ({ ...prev, [songId]: updated }));
  };

  const updateGame = useCallback(() => {
    if (!currentSong || gameState !== 'PLAYING') return;

    const now = Date.now();
    const elapsedTime = now - startTimeRef.current;

    // Spawn notes
    if (noteIndexRef.current < currentSong.notes.length) {
      const nextNote = currentSong.notes[noteIndexRef.current];
      if (elapsedTime >= nextNote.time) {
        setActiveNotes(prev => [...prev, { 
          id: Date.now() + Math.random(), 
          note: nextNote.note, 
          y: -15, 
          hit: false,
          type: Math.random() > 0.5 ? 'star' : 'diamond'
        }]);
        noteIndexRef.current++;
      }
    }

    // Move notes
    setActiveNotes(prev => {
      const nextNotes = prev.map(n => ({ ...n, y: n.y + NOTE_SPEED }));
      
      const missed = nextNotes.filter(n => n.y > 105 && !n.hit); 
      if (missed.length > 0) {
        setCombo(0);
        setHealth(h => Math.max(0, h - 5 * missed.length));
        setFeedback({ text: "Ops!", scale: 1 });
      }

      return nextNotes.filter(n => n.y < 115);
    });

    setHitEffects(prev => prev.filter(e => Date.now() - e.timestamp < 1000));

    if (noteIndexRef.current >= currentSong.notes.length && activeNotes.length === 0) {
      setGameState('WON');
      soundEngine.playNote('C5'); 
      soundEngine.playNote('E4');
      soundEngine.playNote('G4');
      if (currentSong) {
        saveScore(currentSong.id, score);
      }
    } else {
      requestRef.current = requestAnimationFrame(updateGame);
    }
  }, [currentSong, gameState, activeNotes.length, score]);

  useEffect(() => {
    if (gameState === 'PLAYING') {
      startTimeRef.current = Date.now();
      noteIndexRef.current = 0;
      setActiveNotes([]);
      setHitEffects([]);
      setScore(0);
      setCombo(0);
      setHealth(50);
      setFeedback(null);
      requestRef.current = requestAnimationFrame(updateGame);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameState, updateGame]);

  useEffect(() => {
    if (health >= 90) setShowFever(true);
    else setShowFever(false);
  }, [health]);

  const handleNotePlay = (note: NoteName) => {
    if (gameState !== 'PLAYING') return;

    setActiveNotes(prev => {
      const hitIndex = prev.findIndex(n => 
        n.note === note && 
        !n.hit && 
        Math.abs(n.y - HIT_ZONE_Y) < HIT_WINDOW
      );

      if (hitIndex >= 0) {
        const hitNote = prev[hitIndex];
        const accuracy = Math.abs(hitNote.y - HIT_ZONE_Y);
        
        let points = 100;
        let text = "Bom!";
        
        if (accuracy < 4) {
          points = 300;
          text = "PERFEITO!";
        } else if (accuracy < 8) {
          points = 200;
          text = "Legal!";
        }

        soundEngine.playDing();
        setHitEffects(effects => [...effects, { id: Date.now(), note: note, timestamp: Date.now() }]);

        const multiplier = Math.floor(combo / 10) + 1;
        const finalScore = points * multiplier;

        setScore(s => s + finalScore);
        setCombo(c => c + 1);
        setHealth(h => Math.min(100, h + 3));
        setFeedback({ text, scale: 1.3 }); 

        setTimeout(() => setFeedback(prev => prev ? { ...prev, scale: 1 } : null), 200);

        const newNotes = [...prev];
        newNotes[hitIndex] = { ...newNotes[hitIndex], hit: true };
        return newNotes.filter((_, i) => i !== hitIndex); 
      }
      return prev;
    });
  };

  const startSong = (song: Song) => {
    setCurrentSong(song);
    setGameState('READY');
  };

  const startGame = () => {
    setGameState('PLAYING');
  };

  const getNotePosition = (noteName: NoteName) => {
    const whiteKeys = PIANO_NOTES.filter(n => n.type === 'white');
    const noteIndex = PIANO_NOTES.findIndex(n => n.name === noteName);
    const note = PIANO_NOTES[noteIndex];
    
    const whiteKeyWidth = 100 / whiteKeys.length;
    
    if (note.type === 'white') {
        const whiteIndex = whiteKeys.findIndex(n => n.name === noteName);
        return (whiteIndex * whiteKeyWidth) + (whiteKeyWidth / 2);
    } else {
        const prevWhiteIndex = whiteKeys.findIndex(n => PIANO_NOTES.indexOf(n) < noteIndex && PIANO_NOTES[PIANO_NOTES.indexOf(n)+1] === note);
        return (prevWhiteIndex + 1) * whiteKeyWidth;
    }
  };

  const renderLanes = () => {
     const whiteKeys = PIANO_NOTES.filter(n => n.type === 'white');
     const width = 100 / whiteKeys.length;

     return (
       <div className="absolute inset-0 flex pointer-events-none opacity-30">
         {whiteKeys.map((_, i) => (
           <div 
             key={i} 
             className="border-r border-white/20 h-full bg-white/5"
             style={{ width: `${width}%` }}
           />
         ))}
       </div>
     )
  }

  const renderStars = (index: number) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    return '🥉';
  };

  return (
    <div className={`flex flex-col h-full w-full bg-slate-900 overflow-hidden relative ${showFever ? 'animate-pulse-fast' : ''}`}>
      {/* Background */}
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900 via-slate-900 to-black animate-pulse"></div>
        <div className="absolute top-0 left-1/4 w-20 h-[100vh] bg-pink-500 blur-3xl opacity-20 rotate-12 animate-float"></div>
        <div className="absolute top-0 right-1/4 w-20 h-[100vh] bg-blue-500 blur-3xl opacity-20 -rotate-12 animate-float" style={{animationDelay: '1s'}}></div>
      </div>

      {/* GAMEPLAY HUD - Compact for Mobile */}
      {gameState === 'PLAYING' && (
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-50">
           {/* Top Bar */}
           <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
              <button 
                onClick={() => setGameState('SELECT')} 
                className="pointer-events-auto bg-white/20 backdrop-blur-md rounded-full w-8 h-8 flex items-center justify-center text-lg border border-white/30 shadow-lg active:scale-90 transition-transform"
              >
                ⬅️
              </button>

              <div className="flex flex-col items-center gap-1 w-1/2 max-w-[200px]">
                 <div className="w-full h-3 bg-gray-800/80 rounded-full overflow-hidden border border-white/20 relative backdrop-blur-sm">
                   <div 
                     className={`h-full transition-all duration-300 ${showFever ? 'bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 animate-sparkle' : 'bg-gradient-to-r from-green-400 to-green-500'}`}
                     style={{ width: `${health}%` }}
                   />
                 </div>
                 <div className="text-white font-bold text-shadow text-xs font-mono">
                   {score.toLocaleString()} pts
                 </div>
              </div>

              <div className="w-8 flex justify-end">
                {currentMultiplier > 1 && (
                  <div className="bg-yellow-400 text-purple-900 text-[10px] font-black px-2 py-1 rounded-full animate-bounce shadow-lg text-center whitespace-nowrap">
                    {currentMultiplier}x
                  </div>
                )}
              </div>
           </div>

           {combo > 1 && (
             <div className="absolute top-[20%] left-1/2 -translate-x-1/2 text-center opacity-60 pointer-events-none">
                <div className="text-5xl font-black text-white/10 animate-ping absolute inset-0 blur-sm">{combo}</div>
                <div className="text-5xl font-black text-yellow-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] animate-bounce">{combo}</div>
             </div>
           )}
        </div>
      )}

      {/* Menu Header */}
      {gameState === 'SELECT' && (
         <div className="absolute top-2 left-4 z-50">
            <button onClick={onBack} className="bg-white/90 text-pink-600 px-4 py-1 rounded-full font-bold shadow-lg border-2 border-pink-200 text-sm">
              ⬅️ Voltar
            </button>
         </div>
      )}

      {/* SELECT SCREEN - Horizontal Scroll for Mobile Optimization */}
      {gameState === 'SELECT' ? (
        <div className="flex-1 flex flex-col items-center justify-center relative z-20 h-full p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="text-3xl animate-bounce">🎸</div>
            <h2 className="text-xl md:text-3xl text-white font-black font-comic text-center drop-shadow-md">
              Show Mágico!
            </h2>
          </div>
          
          {/* Horizontal Scrolling List */}
          <div className="w-full h-[60%] md:h-[70%] flex gap-4 overflow-x-auto snap-x snap-mandatory px-8 items-center no-scrollbar pb-4">
            {SAMPLE_SONGS.map(song => (
              <button 
                key={song.id}
                onClick={() => startSong(song)}
                className="
                  snap-center shrink-0 min-w-[240px] w-[240px] h-full
                  bg-white/10 hover:bg-white/20 backdrop-blur-md 
                  p-4 rounded-3xl border-2 border-pink-400/50 hover:border-pink-300 
                  transition-all flex flex-col items-center justify-between gap-2 
                  group active:scale-95 shadow-xl relative overflow-hidden
                "
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
                
                <div className="text-center mt-2">
                  <h3 className="text-lg font-bold text-white font-comic leading-tight mb-1">{song.title}</h3>
                  <span className={`
                    text-[10px] text-white px-2 py-0.5 rounded-full inline-block uppercase tracking-wider font-bold
                    ${song.difficulty === 'Fácil' ? 'bg-green-500' : song.difficulty === 'Médio' ? 'bg-yellow-500' : 'bg-red-500'}
                  `}>
                    {song.difficulty}
                  </span>
                </div>

                <div className="text-4xl group-hover:scale-125 transition-transform filter drop-shadow-lg">
                  {song.id.includes('remix') ? '⚡' : '🦄'}
                </div>

                {/* High Scores Display */}
                <div className="w-full bg-black/30 rounded-xl p-2">
                   {highScores[song.id] && highScores[song.id].length > 0 ? (
                     <div className="flex flex-col gap-1">
                       {highScores[song.id].map((hs, idx) => (
                         <div key={idx} className="flex justify-between text-xs text-yellow-200 font-mono border-b border-white/10 last:border-0 pb-0.5 last:pb-0">
                           <span>{renderStars(idx)}</span>
                           <span>{hs.score.toLocaleString()}</span>
                         </div>
                       ))}
                     </div>
                   ) : (
                     <div className="text-[10px] text-white/40 italic text-center py-1">Toque para jogar!</div>
                   )}
                </div>
              </button>
            ))}
            {/* Spacer for scroll end */}
            <div className="w-4 shrink-0"></div>
          </div>
          
          <p className="text-white/60 text-xs mt-2 animate-pulse">Deslize para ver mais músicas ↔️</p>
        </div>
      ) : gameState === 'READY' ? (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
           <div className="bg-gradient-to-b from-pink-500 to-purple-600 p-1 rounded-[2rem] shadow-2xl animate-pop">
             <div className="bg-slate-900 rounded-[1.8rem] p-8 flex flex-col items-center border border-white/20">
                <h2 className="text-3xl text-white font-black font-comic mb-2 text-center">
                  Pronta?
                </h2>
                <p className="text-pink-300 mb-6 font-comic text-center">{currentSong?.title}</p>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setGameState('SELECT')}
                    className="bg-gray-700 text-white px-6 py-3 rounded-full font-bold hover:bg-gray-600 transition"
                  >
                    Voltar
                  </button>
                  <button 
                    onClick={startGame}
                    className="bg-yellow-400 text-purple-900 text-xl font-bold px-8 py-3 rounded-full hover:scale-105 transition-transform animate-pulse shadow-lg"
                  >
                    TOCAR! ▶️
                  </button>
                </div>
             </div>
           </div>
        </div>
      ) : (
        <div className="flex-1 relative flex flex-col min-h-0">
           {/* Highway */}
           <div className="flex-1 relative overflow-hidden bg-gradient-to-b from-slate-900/90 to-purple-900/20">
             {renderLanes()}
             
             {/* Hit Line */}
             <div 
               className="absolute w-full h-2 bg-gradient-to-r from-transparent via-pink-400 to-transparent shadow-[0_0_15px_rgba(255,105,180,1)] z-10 opacity-80"
               style={{ top: `${HIT_ZONE_Y}%` }}
             ></div>
             
             {feedback && (
                <div 
                  className={`absolute top-[40%] left-1/2 -translate-x-1/2 text-4xl font-black text-white italic z-50 drop-shadow-[0_0_10px_rgba(255,0,255,1)] pointer-events-none whitespace-nowrap ${feedback.text === 'PERFEITO!' ? 'animate-pop' : ''}`}
                  style={{ transform: `translate(-50%, -50%) scale(${feedback.scale}) rotate(-5deg)` }}
                >
                   {feedback.text}
                </div>
             )}

             {hitEffects.map(effect => {
                const left = getNotePosition(effect.note);
                const isBlack = effect.note.includes('#');

                return (
                  <div 
                    key={effect.id}
                    className="absolute z-40 pointer-events-none"
                    style={{ 
                      left: `${left}%`, 
                      top: `${HIT_ZONE_Y}%`, 
                      width: '6.66%',
                      transform: 'translateX(-50%) translateY(-50%)',
                    }}
                  >
                     {/* Magical Beam Trail extending UPWARDS */}
                     <div className={`
                        absolute -bottom-6 left-1/2 -translate-x-1/2 w-full h-[45vh]
                        bg-gradient-to-t ${isBlack ? 'from-unicorn-purple' : 'from-unicorn-pink'} to-transparent
                        blur-[4px] origin-bottom animate-beam
                     `}></div>

                     <div className={`absolute left-0 top-0 w-full h-12 -translate-y-1/2 rounded-full animate-ping opacity-80 ${isBlack ? 'bg-purple-300' : 'bg-pink-300'}`}></div>
                     <div className="absolute left-1/2 -top-10 -translate-x-1/2 text-2xl animate-bounce">🌟</div>
                  </div>
                );
             })}

             {activeNotes.map(n => {
                const left = getNotePosition(n.note);
                const isBlack = n.note.includes('#');
                return (
                  <div 
                    key={n.id}
                    className="absolute w-[6.66%] z-20 will-change-transform"
                    style={{ 
                      left: `${left}%`, 
                      top: `${n.y}%`,
                      transform: 'translateX(-50%)',
                      height: '8%',
                    }}
                  >
                    <div className={`
                      absolute -top-16 left-1/2 -translate-x-1/2 w-[60%] h-20
                      bg-gradient-to-t ${isBlack ? 'from-purple-500/90 to-transparent' : 'from-pink-400/90 to-transparent'}
                      blur-[1px]
                    `}></div>

                    <div className={`
                      w-full h-full flex items-center justify-center text-xl shadow-lg relative z-10
                      rounded-lg border-2
                      ${isBlack 
                        ? 'bg-purple-600 border-purple-300 shadow-[0_0_10px_rgba(147,51,234,0.5)]' 
                        : 'bg-pink-400 border-pink-200 shadow-[0_0_10px_rgba(236,72,153,0.5)]'}
                      ${n.y > HIT_ZONE_Y - 5 && n.y < HIT_ZONE_Y + 5 ? 'brightness-125 scale-105' : ''}
                    `}>
                      <span className="filter drop-shadow-md text-lg">
                        {n.type === 'star' ? '⭐' : '💎'}
                      </span>
                    </div>
                  </div>
                );
             })}

             {/* WON SCREEN */}
             {gameState === 'WON' && (
               <div className="absolute inset-0 bg-black/85 z-[60] flex flex-col items-center justify-center animate-fade-in backdrop-blur-sm p-4">
                 <div className="bg-slate-800 border-4 border-yellow-400 p-6 rounded-[2rem] flex flex-col items-center shadow-2xl max-w-sm w-full relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
                    
                    <div className="text-6xl mb-2 animate-bounce">🏆</div>
                    <h2 className="text-4xl text-yellow-300 font-black mb-2 font-comic text-center drop-shadow-lg">
                      SHOW!
                    </h2>
                    
                    <div className="flex flex-col items-center bg-black/30 w-full rounded-xl p-4 mb-4 border border-white/10">
                      <span className="text-gray-400 text-xs uppercase tracking-widest mb-1">Pontuação Final</span>
                      <span className="text-4xl text-white font-mono font-bold">{score.toLocaleString()}</span>
                    </div>

                    <button 
                      onClick={() => { setGameState('SELECT'); setScore(0); }}
                      className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 rounded-xl text-xl font-bold font-comic shadow-xl active:scale-95 hover:brightness-110 transition-all"
                    >
                      Continuar
                    </button>
                 </div>
               </div>
             )}
           </div>

           {/* Piano Area - 40% height for bigger keys on mobile */}
           <div className="h-[40%] relative z-20 border-t-4 border-pink-500/50 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
             <Piano onNotePlay={handleNotePlay} disabled={gameState === 'WON'} variant="arcade" />
           </div>
        </div>
      )}
    </div>
  );
};