import React from 'react';
import { InstrumentType } from '../types';
import { soundEngine } from '../services/soundEngine';

export const Settings: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const handleInstrumentChange = (type: InstrumentType) => {
    soundEngine.setInstrument(type);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    soundEngine.setVolume(parseFloat(e.target.value));
  };

  return (
    <div className="h-full w-full bg-unicorn-pink flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-full border-8 border-pink-200">
        <div className="bg-pink-100 p-6 flex items-center border-b-4 border-pink-200">
          <button onClick={onBack} className="text-pink-500 text-3xl font-bold mr-4 hover:scale-110 transition-transform">⬅️</button>
          <h1 className="text-3xl text-pink-500 font-bold font-comic">Opções Mágicas ✨</h1>
        </div>
        
        <div className="p-8 overflow-y-auto bg-white">
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-600 mb-4 font-comic">Volume da Música</h2>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.1" 
              defaultValue="0.5"
              onChange={handleVolumeChange}
              className="w-full h-6 bg-pink-100 rounded-full appearance-none cursor-pointer accent-unicorn-purple"
            />
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-600 mb-6 font-comic">Som do Instrumento</h2>
            <div className="grid grid-cols-3 gap-6">
              <button 
                onClick={() => handleInstrumentChange(InstrumentType.PIANO)}
                className="p-6 border-4 border-pink-100 rounded-3xl hover:border-unicorn-pink hover:bg-pink-50 transition flex flex-col items-center group"
              >
                <span className="text-5xl mb-3 group-hover:scale-110 transition-transform">🎹</span>
                <span className="font-bold text-gray-600 font-comic">Piano Mágico</span>
              </button>
              <button 
                onClick={() => handleInstrumentChange(InstrumentType.XYLOPHONE)}
                className="p-6 border-4 border-pink-100 rounded-3xl hover:border-unicorn-blue hover:bg-blue-50 transition flex flex-col items-center group"
              >
                <span className="text-5xl mb-3 group-hover:scale-110 transition-transform">🥢</span>
                <span className="font-bold text-gray-600 font-comic">Xilofone</span>
              </button>
              <button 
                onClick={() => handleInstrumentChange(InstrumentType.SYNTH)}
                className="p-6 border-4 border-pink-100 rounded-3xl hover:border-unicorn-purple hover:bg-purple-50 transition flex flex-col items-center group"
              >
                <span className="text-5xl mb-3 group-hover:scale-110 transition-transform">👾</span>
                <span className="font-bold text-gray-600 font-comic">Flauta Doce</span>
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};