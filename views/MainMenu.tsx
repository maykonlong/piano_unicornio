import React from 'react';
import { GameMode } from '../types';

interface MainMenuProps {
  onSelectMode: (mode: GameMode) => void;
}

const MenuButton: React.FC<{ 
  onClick: () => void; 
  color: string; 
  icon: string; 
  title: string; 
  desc: string 
}> = ({ onClick, color, icon, title, desc }) => (
  <button 
    onClick={onClick}
    className={`${color} text-white rounded-2xl md:rounded-3xl p-1 md:p-4 shadow-[0_4px_0_rgba(0,0,0,0.1)] transform transition-all hover:scale-105 active:scale-95 flex flex-col items-center justify-center gap-1 md:gap-2 w-full h-full min-h-[80px] border-2 md:border-4 border-white/40 hover:rotate-1`}
  >
    <span className="text-3xl md:text-5xl lg:text-6xl filter drop-shadow-md animate-float">{icon}</span>
    <span className="text-sm md:text-xl lg:text-2xl font-bold font-comic mt-1 drop-shadow-sm leading-none whitespace-nowrap">{title}</span>
    <span className="text-[10px] md:text-sm font-comic opacity-90 leading-tight hidden sm:block">{desc}</span>
  </button>
);

export const MainMenu: React.FC<MainMenuProps> = ({ onSelectMode }) => {
  return (
    <div className="h-full w-full bg-gradient-to-br from-unicorn-pink via-pink-100 to-unicorn-blue flex flex-col items-center justify-center relative overflow-hidden p-2 md:p-4">
      {/* Magical Background decorations */}
      <div className="absolute top-4 left-4 text-4xl md:text-7xl opacity-40 animate-float">🦄</div>
      <div className="absolute bottom-4 right-4 text-4xl md:text-7xl opacity-40 animate-bounce-slow">🌈</div>
      <div className="absolute top-10 right-20 text-2xl md:text-4xl opacity-50 animate-pulse">✨</div>
      
      {/* Cloud Blobs */}
      <div className="absolute top-1/2 left-1/4 w-[300px] h-[300px] bg-unicorn-lilac rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float"></div>
      <div className="absolute top-1/4 right-1/4 w-[250px] h-[250px] bg-unicorn-blue rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style={{animationDelay: '2s'}}></div>

      <h1 className="text-2xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 mb-2 md:mb-8 z-10 drop-shadow-lg font-comic tracking-tight text-center leading-tight py-2">
        Piano Unicórnio Mágico 🦄
      </h1>

      {/* Main Grid - Forced 4 columns for landscape efficiency */}
      <div className="flex-1 w-full max-w-6xl z-10 px-2 md:px-8 pb-2 md:pb-4 grid grid-cols-4 gap-2 md:gap-6 items-stretch justify-center max-h-[300px] md:max-h-none">
        <MenuButton 
          onClick={() => onSelectMode(GameMode.FREE_PLAY)}
          color="bg-unicorn-pink hover:bg-pink-400"
          icon="🎹"
          title="Tocar"
          desc="Livre para sonhar"
        />
        <MenuButton 
          onClick={() => onSelectMode(GameMode.CHALLENGE)}
          color="bg-unicorn-purple hover:bg-purple-400"
          icon="👑"
          title="Desafios"
          desc="Ganhe coroas"
        />
        <MenuButton 
          onClick={() => onSelectMode(GameMode.MAGIC_SHOW)}
          color="bg-unicorn-gold hover:bg-yellow-400"
          icon="🎸"
          title="Show"
          desc="Guitar Hero!"
        />
        <MenuButton 
          onClick={() => onSelectMode(GameMode.LEARN)}
          color="bg-unicorn-blue hover:bg-blue-400"
          icon="🎓"
          title="Aulas"
          desc="Passo a passo"
        />
      </div>

      <button 
        onClick={() => onSelectMode(GameMode.SETTINGS)}
        className="absolute top-2 right-2 md:bottom-6 md:right-6 p-2 md:p-3 bg-white rounded-full shadow-lg text-pink-400 hover:text-unicorn-purple transition-all hover:scale-110 border-2 border-pink-100 z-20"
      >
        <span className="text-xl md:text-2xl">⚙️</span>
      </button>
    </div>
  );
};
