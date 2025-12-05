import React from 'react';
import { NoteDef } from '../types';

interface PianoKeyProps {
  note: NoteDef;
  isPressed: boolean;
  onPress: (note: NoteDef) => void;
  onRelease: (note: NoteDef) => void;
  labelVisible?: boolean;
  highlight?: boolean; // For tutorial/hints
}

export const PianoKey: React.FC<PianoKeyProps> = ({ 
  note, 
  isPressed, 
  onPress, 
  onRelease, 
  labelVisible = true,
  highlight = false
}) => {
  const isWhite = note.type === 'white';

  const baseClasses = "relative select-none touch-none transition-all duration-150 ease-out border-b-[6px] rounded-b-2xl flex flex-col justify-end items-center pb-3 cursor-pointer overflow-hidden";
  
  const whiteClasses = `
    h-full w-full bg-gradient-to-b from-white to-pink-50 border-pink-200 text-pink-500 z-10
    ${isPressed ? 'bg-pink-100 border-b-2 translate-y-1 shadow-inner' : 'shadow-[0_4px_0_rgba(255,183,213,0.5)]'}
    ${highlight ? 'ring-4 ring-unicorn-gold animate-pulse bg-yellow-50' : ''}
  `;

  const blackClasses = `
    absolute h-2/3 w-[60%] -mr-[30%] bg-gradient-to-b from-unicorn-purple to-purple-800 border-purple-900 text-white z-20 top-0 right-0 left-auto
    ${isPressed ? 'from-purple-600 to-purple-900 border-b-2 translate-y-1 shadow-inner' : 'shadow-[0_4px_0_rgba(100,0,100,0.3)]'}
    ${highlight ? 'ring-2 ring-unicorn-gold animate-pulse from-purple-500' : ''}
  `;

  return (
    <div
      className={`${baseClasses} ${isWhite ? whiteClasses : blackClasses} ${!isWhite ? 'mx-0' : ''}`}
      style={!isWhite ? { left: '50%', transform: 'translateX(-50%)' } : {}}
      onMouseDown={() => onPress(note)}
      onMouseUp={() => onRelease(note)}
      onMouseLeave={() => isPressed && onRelease(note)}
      onTouchStart={(e) => { e.preventDefault(); onPress(note); }}
      onTouchEnd={(e) => { e.preventDefault(); onRelease(note); }}
    >
      {labelVisible && isWhite && (
        <span className="font-comic font-bold text-lg pointer-events-none mb-2 opacity-60">{note.label}</span>
      )}
      
      {/* Sparkle Effect for press */}
      {isPressed && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-none z-30">
           <div className="text-2xl animate-spin">⭐</div>
        </div>
      )}
      
      {/* Decorative Shine */}
      <div className="absolute top-2 left-2 w-full h-full bg-gradient-to-br from-white/40 to-transparent pointer-events-none rounded-t-lg"></div>
    </div>
  );
};