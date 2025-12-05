import React, { useState, useEffect } from 'react';
import { OrientationWarning } from './components/OrientationWarning';
import { MainMenu } from './views/MainMenu';
import { FreePlay } from './views/FreePlay';
import { Challenge } from './views/Challenge';
import { Learn } from './views/Learn';
import { Settings } from './views/Settings';
import { MagicShow } from './views/MagicShow';
import { GameMode } from './types';
import { soundEngine } from './services/soundEngine';

const App: React.FC = () => {
  const [isPortrait, setIsPortrait] = useState(false);
  const [currentMode, setCurrentMode] = useState<GameMode>(GameMode.MENU);

  useEffect(() => {
    const checkOrientation = () => {
      // Logic: If height > width, it's portrait.
      setIsPortrait(window.innerHeight > window.innerWidth);
    };
    
    checkOrientation();
    window.addEventListener('resize', checkOrientation);

    // Initialize audio context on first user interaction to comply with browser autoplay policies
    const initAudio = () => {
      soundEngine.initialize();
      window.removeEventListener('click', initAudio);
      window.removeEventListener('touchstart', initAudio);
    };

    window.addEventListener('click', initAudio);
    window.addEventListener('touchstart', initAudio);

    return () => window.removeEventListener('resize', checkOrientation);
  }, []);

  if (isPortrait) {
    return <OrientationWarning />;
  }

  const renderMode = () => {
    switch (currentMode) {
      case GameMode.MENU:
        return <MainMenu onSelectMode={setCurrentMode} />;
      case GameMode.FREE_PLAY:
        return <FreePlay onBack={() => setCurrentMode(GameMode.MENU)} />;
      case GameMode.CHALLENGE:
        return <Challenge onBack={() => setCurrentMode(GameMode.MENU)} />;
      case GameMode.MAGIC_SHOW:
        return <MagicShow onBack={() => setCurrentMode(GameMode.MENU)} />;
      case GameMode.LEARN:
        return <Learn onBack={() => setCurrentMode(GameMode.MENU)} />;
      case GameMode.SETTINGS:
        return <Settings onBack={() => setCurrentMode(GameMode.MENU)} />;
      default:
        return <MainMenu onSelectMode={setCurrentMode} />;
    }
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-gray-100 font-sans text-gray-900 select-none">
      {renderMode()}
    </div>
  );
};

export default App;