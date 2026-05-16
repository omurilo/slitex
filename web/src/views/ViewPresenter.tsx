import React, { useState, useEffect, useCallback, useRef } from 'react';
import { type PresentationAST } from '../types';
import { useSyncSlides } from '../hooks/useSyncSlides';
import { SlideRenderer } from '../components/SlideRenderer';

interface PresenterProps {
  ast: PresentationAST;
  initialSlide?: number;
}

export const ViewPresenter: React.FC<PresenterProps> = ({ ast, initialSlide = 0 }) => {
  const { currentSlide, currentStep, updateState } = useSyncSlides(initialSlide);
  const [seconds, setSeconds] = useState(0);
  const touchStartX = useRef(0);

  useEffect(() => {
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (sec: number) => {
    const m = String(Math.floor(sec / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  const frames = ast.frames || [];
  const activeFrame = frames[currentSlide];
  const nextFrame = frames[currentSlide + 1];

  const handleNext = useCallback(() => {
    const maxSteps = activeFrame?.maxSteps ?? 1;
    if (currentStep < maxSteps) {
      updateState(currentSlide, currentStep + 1);
    } else if (currentSlide < frames.length - 1) {
      updateState(currentSlide + 1, 1);
    }
  }, [currentSlide, currentStep, frames.length, activeFrame, updateState]);

  const handlePrev = useCallback(() => {
    if (currentStep > 1) {
      updateState(currentSlide, currentStep - 1);
    } else if (currentSlide > 0) {
      updateState(currentSlide - 1, 1);
    }
  }, [currentSlide, currentStep, updateState]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); handleNext(); }
      else if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 50) {
      if (dx < 0) handleNext();
      else handlePrev();
    }
  };

  if (!activeFrame) return <div className="p-8 text-center">Nenhum slide processado na AST.</div>;

  return (
    <div
      className="h-screen w-screen bg-slate-950 text-slate-100 flex flex-col font-sans overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header */}
      <header className="bg-slate-900 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            Modo Apresentador
          </span>
          <h1 className="font-semibold text-sm max-w-md truncate text-slate-400">{ast.title}</h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">Tempo</p>
            <p className="font-mono text-xl text-emerald-400 font-bold">{formatTime(seconds)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">Slide</p>
            <p className="font-mono text-xl text-indigo-400 font-bold">{currentSlide + 1} / {frames.length}</p>
          </div>
          {(activeFrame.maxSteps ?? 1) > 1 && (
            <div className="text-center">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">Step</p>
              <p className="font-mono text-xl text-amber-400 font-bold">{currentStep} / {activeFrame.maxSteps}</p>
            </div>
          )}
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 grid grid-cols-12 gap-6 p-6 overflow-hidden">
        {/* Current slide preview */}
        <div className="col-span-7 flex flex-col gap-3 h-full overflow-hidden">
          <p className="text-xs font-bold uppercase text-slate-500 tracking-widest">Tela Ativa no Projetor</p>
          <div className="flex-1 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl p-8 border border-slate-800 shadow-2xl flex flex-col overflow-y-auto">
            <h2 className="text-3xl font-black tracking-tight mb-1">{activeFrame.title}</h2>
            {activeFrame.subtitle && (
              <h3 className="text-lg text-indigo-600 dark:text-indigo-400 font-medium mb-4">{activeFrame.subtitle}</h3>
            )}
            <div className="flex-1">
              {activeFrame.content.map((node, i) => (
                <SlideRenderer key={i} node={node} currentStep={currentStep} theme={ast.theme} />
              ))}
            </div>
          </div>
        </div>

        {/* Right panel: next + notes */}
        <div className="col-span-5 flex flex-col gap-6 h-full overflow-hidden">
          {/* Next slide */}
          <div className="flex flex-col gap-3 h-[40%] overflow-hidden">
            <p className="text-xs font-bold uppercase text-slate-500 tracking-widest">Próximo Slide</p>
            <div className="flex-1 bg-slate-900/60 rounded-2xl p-6 border border-slate-800 opacity-70 flex flex-col overflow-y-auto">
              {nextFrame ? (
                <>
                  <h2 className="text-xl font-bold mb-1">{nextFrame.title}</h2>
                  {nextFrame.subtitle && (
                    <h3 className="text-sm text-indigo-400 mb-3">{nextFrame.subtitle}</h3>
                  )}
                  <div className="text-xs text-slate-500 line-clamp-3">
                    {nextFrame.content
                      .flatMap((n) => n.inline ?? [])
                      .map((il) => il.value)
                      .join(' ')
                      .slice(0, 150)}
                  </div>
                </>
              ) : (
                <p className="m-auto text-slate-500 italic font-medium">Fim da apresentação</p>
              )}
            </div>
          </div>

          {/* Speaker notes */}
          <div className="flex flex-col gap-3 flex-1 overflow-hidden">
            <p className="text-xs font-bold uppercase text-slate-500 tracking-widest">Notas do Apresentador</p>
            <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-5 font-sans text-slate-300 leading-relaxed overflow-y-auto">
              {activeFrame.notes ? (
                <p className="text-base whitespace-pre-wrap">{activeFrame.notes}</p>
              ) : (
                <p className="text-slate-600 italic text-sm">Sem notas para este slide.</p>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer controls */}
      <footer className="bg-slate-900/40 border-t border-slate-800 px-6 py-4 flex justify-between items-center">
        <div className="flex gap-2">
          <kbd className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs text-slate-400 font-mono">←</kbd>
          <kbd className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs text-slate-400 font-mono">→</kbd>
          <span className="text-xs text-slate-500 my-auto ml-2">Navegar por teclado ou botões</span>
        </div>
        <div className="flex gap-4">
          <button
            onClick={handlePrev}
            disabled={currentSlide === 0 && currentStep === 1}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 font-medium text-sm transition-all active:scale-95 disabled:opacity-40"
          >
            Anterior
          </button>
          <button
            onClick={handleNext}
            disabled={currentSlide === frames.length - 1 && currentStep >= (activeFrame.maxSteps ?? 1)}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-md active:scale-95 disabled:opacity-40"
          >
            Avançar
          </button>
        </div>
      </footer>
    </div>
  );
};
