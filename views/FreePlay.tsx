import React, { useState, useRef } from 'react';
import { Piano } from '../components/Piano';
import { NoteName } from '../types';
import { soundEngine } from '../services/soundEngine';

interface FreePlayProps {
  onBack: () => void;
}

export const FreePlay: React.FC<FreePlayProps> = ({ onBack }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordedNotes, setRecordedNotes] = useState<{note: NoteName, time: number}[]>([]);
  const recordingStartTime = useRef<number>(0);
  const playbackTimeoutIds = useRef<number[]>([]);

  const handleNotePlay = (note: NoteName) => {
    if (isRecording) {
      const time = Date.now() - recordingStartTime.current;
      setRecordedNotes(prev => [...prev, { note, time }]);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
    } else {
      setRecordedNotes([]);
      recordingStartTime.current = Date.now();
      setIsRecording(true);
    }
  };

  const playRecording = () => {
    if (recordedNotes.length === 0) return;
    setIsPlaying(true);
    
    recordedNotes.forEach(({ note, time }) => {
      const id = window.setTimeout(() => {
        soundEngine.playNote(note);
      }, time);
      playbackTimeoutIds.current.push(id);
    });

    const lastNoteTime = recordedNotes[recordedNotes.length - 1].time;
    const endId = window.setTimeout(() => {
      setIsPlaying(false);
      playbackTimeoutIds.current = [];
    }, lastNoteTime + 1000);
    playbackTimeoutIds.current.push(endId);
  };

  const stopPlayback = () => {
    playbackTimeoutIds.current.forEach(id => clearTimeout(id));
    playbackTimeoutIds.current = [];
    setIsPlaying(false);
  };

  return (
    <div className="flex flex-col h-full w-full bg-unicorn-pink bg-opacity-20 p-4 relative">
      <div className="absolute inset-0 z-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDYwIDYwIiBmaWxsPSJub25lIj48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1zaXplPSIyMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgb3BhY2l0eT0iMC4xIj7wn4aEPC90ZXh0Pjwvc3ZnPg==')] opacity-50"></div>

      {/* Header Controls */}
      <div className="flex justify-between items-center mb-4 bg-white/60 backdrop-blur-md p-3 rounded-2xl shadow-lg border-2 border-white z-10">
        <button 
          onClick={onBack}
          className="bg-unicorn-blue hover:bg-blue-300 text-white px-6 py-2 rounded-full font-bold transition-colors font-comic flex items-center gap-2"
        >
          ⬅️ Voltar
        </button>
        
        <div className="flex gap-4">
           {/* Recording Controls */}
           {!isPlaying && (
             <button
              onClick={toggleRecording}
              className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold transition-all border-2 border-white shadow-sm font-comic ${
                isRecording 
                  ? 'bg-red-400 text-white animate-pulse' 
                  : 'bg-pink-100 hover:bg-pink-200 text-pink-500'
              }`}
             >
               <div className="text-xl">💖</div>
               {isRecording ? 'Gravando...' : 'Gravar Mágica'}
             </button>
           )}

           {recordedNotes.length > 0 && !isRecording && (
             <button
               onClick={isPlaying ? stopPlayback : playRecording}
               className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold transition-all text-white font-comic border-2 border-white shadow-sm ${
                 isPlaying ? 'bg-yellow-400 hover:bg-yellow-500' : 'bg-green-400 hover:bg-green-500'
               }`}
             >
               <span>{isPlaying ? '⏹️ Parar' : '▶️ Tocar Show!'}</span>
             </button>
           )}
        </div>
        
        <div className="text-unicorn-purple font-comic font-bold text-lg hidden md:block">
          Modo Livre ✨
        </div>
      </div>

      {/* Piano Container */}
      <div className="flex-1 min-h-0 relative z-10">
        <Piano onNotePlay={handleNotePlay} />
        
        {isRecording && (
          <div className="absolute top-4 right-4 text-red-500 font-bold animate-bounce font-comic bg-white/80 px-3 py-1 rounded-full">
            Gravando... 🔴
          </div>
        )}
      </div>
    </div>
  );
};