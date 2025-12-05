import React from 'react';

export const OrientationWarning: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 bg-unicorn-pink flex flex-col items-center justify-center text-white p-8 text-center animate-fade-in font-comic">
      <div className="text-8xl mb-8 animate-bounce">🦄 📱</div>
      <h1 className="text-4xl font-bold mb-4 drop-shadow-md">Vire o celular, princesinha!</h1>
      <p className="text-2xl opacity-90">O mundo mágico do arco-íris funciona deitadinho.</p>
      <div className="mt-8 text-4xl animate-spin">🌈</div>
    </div>
  );
};