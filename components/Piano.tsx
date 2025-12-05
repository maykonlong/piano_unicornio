import React, { useState } from 'react';
import { PianoKey } from './PianoKey';
import { PIANO_NOTES } from '../constants';
import { NoteDef, NoteName } from '../types';
import { soundEngine } from '../services/soundEngine';

interface PianoProps {
  onNotePlay?: (note: NoteName) => void;
  highlightNote?: NoteName | null;
  disabled?: boolean;
  variant?: 'default' | 'arcade'; // arcade removes padding/borders for games
}

export const Piano: React.FC<PianoProps> = ({ 
  onNotePlay, 
  highlightNote, 
  disabled = false,
  variant = 'default'
}) => {
  const [pressedNotes, setPressedNotes] = useState<Set<NoteName>>(new Set());

  const handlePress = (note: NoteDef) => {
    if (disabled) return;
    soundEngine.playNote(note.name);
    setPressedNotes(prev => new Set(prev).add(note.name));
    if (onNotePlay) onNotePlay(note.name);
  };

  const handleRelease = (note: NoteDef) => {
    setPressedNotes(prev => {
      const next = new Set(prev);
      next.delete(note.name);
      return next;
    });
  };

  const renderKeys = () => {
    const keys = [];
    const whiteNotes = PIANO_NOTES.filter(n => n.type === 'white');

    for (let i = 0; i < whiteNotes.length; i++) {
      const whiteNote = whiteNotes[i];
      const fullIndex = PIANO_NOTES.findIndex(n => n.name === whiteNote.name);
      const nextNote = PIANO_NOTES[fullIndex + 1];
      const hasBlack = nextNote && nextNote.type === 'black';

      keys.push(
        <div key={whiteNote.name} className="relative flex-1 h-full mx-[1px] first:ml-0 last:mr-0">
          <PianoKey 
            note={whiteNote} 
            isPressed={pressedNotes.has(whiteNote.name)} 
            onPress={handlePress} 
            onRelease={handleRelease}
            highlight={highlightNote === whiteNote.name}
            labelVisible={variant === 'default'} // Hide labels in arcade to reduce clutter
          />
          {hasBlack && (
            <div className="absolute top-0 right-0 w-0 h-full overflow-visible z-20">
              <div className={`absolute top-0 w-full h-[60%] ${variant === 'arcade' ? 'translate-x-1/2 right-0' : '-right-4 w-9'}`}> 
                 <PianoKey 
                  note={nextNote} 
                  isPressed={pressedNotes.has(nextNote.name)} 
                  onPress={handlePress} 
                  onRelease={handleRelease}
                  highlight={highlightNote === nextNote.name}
                  labelVisible={false}
                />
              </div>
            </div>
          )}
        </div>
      );
    }
    return keys;
  };

  if (variant === 'arcade') {
    return (
      <div className="w-full h-full flex relative select-none bg-pink-900/20">
         {/* Simple container without padding/borders for maximum size */}
         <div className="relative flex w-full h-full z-10">
           {renderKeys()}
         </div>
      </div>
    );
  }

  // Default "Toy" Look
  return (
    <div className="w-full h-full bg-gradient-to-r from-unicorn-pink via-unicorn-lilac to-unicorn-blue p-0.5 md:p-3 rounded-xl md:rounded-[2rem] shadow-[0_10px_30px_rgba(224,176,255,0.6)] flex relative overflow-hidden select-none border-2 md:border-4 border-white/50">
       {/* Background Clouds decoration */}
       <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-30 pointer-events-none">
          <div className="absolute top-2 left-10 text-4xl animate-float">☁️</div>
          <div className="absolute bottom-4 right-20 text-4xl animate-float" style={{animationDelay: '1s'}}>🦄</div>
          <div className="absolute top-1/2 left-1/2 text-2xl animate-pulse">✨</div>
       </div>
       
       <div className="relative flex w-full h-full z-10 p-0 md:p-1 bg-white/40 backdrop-blur-sm rounded-lg md:rounded-2xl shadow-inner">
         {renderKeys()}
       </div>
    </div>
  );
};