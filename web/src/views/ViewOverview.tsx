import React from 'react';
import type { PresentationAST } from '../types';
import { useSyncSlides } from '../hooks/useSyncSlides';

interface OverviewProps {
  ast: PresentationAST;
}

export const ViewOverview: React.FC<OverviewProps> = ({ ast }) => {
  const { currentSlide, updateState } = useSyncSlides(0);
  const frames = ast.frames || [];

  const handleSelect = (index: number) => {
    updateState(index, 1);
    // Navigate projector by opening or focusing it
    window.opener?.focus?.();
    window.close?.();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-white">{ast.title || 'Apresentação'}</h1>
            <p className="text-slate-400 mt-1">{frames.length} slides</p>
          </div>
          <button
            onClick={() => window.close()}
            className="text-slate-500 hover:text-white text-sm transition-colors"
          >
            Fechar
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {frames.map((frame, i) => (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              className={`rounded-xl p-4 text-left transition-all border-2 ${
                i === currentSlide
                  ? 'border-indigo-500 bg-indigo-900/30 shadow-lg shadow-indigo-500/10'
                  : 'border-slate-800 bg-slate-900 hover:border-slate-600 hover:bg-slate-800'
              }`}
            >
              <div className="text-xs text-slate-500 font-mono mb-2 font-bold">{String(i + 1).padStart(2, '0')}</div>
              <div className="text-white font-semibold text-sm leading-tight truncate">
                {frame.title || 'Sem título'}
              </div>
              {frame.subtitle && (
                <div className="text-slate-400 text-xs truncate mt-1">{frame.subtitle}</div>
              )}
              {frame.notes && (
                <div className="mt-2 w-2 h-2 rounded-full bg-amber-400/70" title="Tem notas" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
