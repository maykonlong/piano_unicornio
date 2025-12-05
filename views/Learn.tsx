import React, { useState } from 'react';
import { Piano } from '../components/Piano';
import { NoteName } from '../types';

export const Learn: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const lessonNotes: NoteName[] = ['C4', 'D4', 'E4', 'C4']; 
  const [step, setStep] = useState(0);
  const [feedback, setFeedback] = useState("Toque a notinha que brilha!");

  const currentTarget = lessonNotes[step];

  const handleNotePlay = (note: NoteName) => {
    if (step >= lessonNotes.length) return;

    if (note === currentTarget) {
      setFeedback("Muito bem, princesinha! 🌟");
      if (step + 1 < lessonNotes.length) {
        setTimeout(() => {
          setStep(s => s + 1);
          setFeedback("Próxima notinha...");
        }, 800);
      } else {
        setTimeout(() => {
            setStep(s => s + 1);
            setFeedback("Você completou a mágica! 🎉");
        }, 800);
      }
    } else {
      setFeedback("Ops, tente a nota amarelinha! 💛");
    }
  };

  const restart = () => {
    setStep(0);
    setFeedback("Vamos começar! Toque o Dó.");
  };

  return (
    <div className="flex flex-col h-full w-full bg-pink-50">
      <div className="p-4 flex items-center justify-between bg-white/50 backdrop-blur-sm shadow-sm z-10">
        <button onClick={onBack} className="text-pink-500 font-bold px-4 py-2 rounded-full bg-pink-100 hover:bg-pink-200">
          ⬅️ Voltar
        </button>
        <h2 className="text-2xl font-bold text-unicorn-purple font-comic">Aula 1: Doce Melodia</h2>
        <div className="w-20"></div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCIgdmlld0JveD0iMCAwIDgwIDgwIiBmaWxsPSJub25lIj48cGF0aCBkPSJNMjAgMjBWMzBINDBWMjBIMjBaIiBmaWxsPSIjRkZDN0U2IiBvcGFjaXR5PSIwLjIiLz48L3N2Zz4=')]">
        <div className="bg-white p-8 rounded-[2rem] shadow-[0_10px_40px_rgba(255,183,213,0.5)] mb-8 max-w-lg text-center border-4 border-unicorn-pink relative">
          <div className="absolute -top-6 -left-6 text-5xl animate-bounce">🦄</div>
          
          <p className="text-3xl font-bold text-pink-600 mb-2 font-comic">{feedback}</p>
          
          <div className="flex gap-3 justify-center mt-6">
            {lessonNotes.map((n, i) => (
              <div 
                key={i} 
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-4 transition-all duration-300
                  ${i === step ? 'bg-yellow-300 border-yellow-500 scale-125 shadow-lg text-yellow-900 animate-pulse' : 
                    i < step ? 'bg-green-300 border-green-500 text-white' : 'bg-gray-100 border-gray-200 text-gray-300'}`}
              >
                {n.replace('4', '')}
              </div>
            ))}
          </div>
          {step >= lessonNotes.length && (
            <button onClick={restart} className="mt-8 bg-unicorn-purple text-white font-bold py-3 px-8 rounded-full hover:bg-purple-400 transition shadow-lg font-comic text-xl animate-pulse">
              Brincar de novo!
            </button>
          )}
        </div>
      </div>

      <div className="h-[35%] w-full relative z-10">
        <Piano 
          highlightNote={step < lessonNotes.length ? currentTarget : null}
          onNotePlay={handleNotePlay}
        />
      </div>
    </div>
  );
};