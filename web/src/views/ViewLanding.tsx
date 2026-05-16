import React from 'react';
import { type PresentationAST } from '../types';
import { ViewProjector } from './ViewProjector';

interface LandingProps {
  ast: PresentationAST;
}

export const ViewLanding: React.FC<LandingProps> = ({ ast }) => {
  const openPresenterMode = () => {
    window.open('/presenter', '_blank', 'width=1200,height=800');
  };

  const openProjectorMode = () => {
    window.open('/projector', '_blank', 'width=1920,height=1080,menubar=no,toolbar=no');
  };

  return (
    <div className="min-h-screen w-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* Painel Flutuante de Controle */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur border-b border-slate-200 dark:border-slate-800 px-8 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono font-bold text-xs tracking-widest uppercase text-slate-400">Live Server Actived</span>
        </div>
        <div className="flex gap-4">
          <button onClick={openPresenterMode} className="px-4 py-2 text-sm font-semibold rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:opacity-90 transition-all shadow-sm">💻 Abrir Modo Apresentador</button>
          <button onClick={openProjectorMode} className="px-4 py-2 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-600/10">📺 Tela Cheia (Projetor)</button>
        </div>
      </div>

      {/* Preview Local Embarcado */}
      <div className="flex-1 flex justify-center items-center p-8 bg-slate-100 dark:bg-slate-900/40">
        <div className="w-full max-w-5xl aspect-video bg-white dark:bg-slate-950 rounded-2xl shadow-xl border dark:border-slate-800 overflow-hidden">
          <ViewProjector ast={ast} />
        </div>
      </div>
    </div>
  );
};
