import React, { useState, useEffect } from 'react';
import { type PresentationAST } from '../types';
import { useSyncSlides } from '../hooks/useSyncSlides';
import { SlideRenderer } from '../components/SlideRenderer';

interface PresenterProps {
  ast: PresentationAST;
}

export const ViewPresenter: React.FC<PresenterProps> = ({ ast }) => {
  const { currentSlide, currentStep, updateState } = useSyncSlides(0);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setSeconds(s => s + 1), 1000);
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

  const handleNext = () => {
    // Lógica simplificada: avança slide. Na versão final, avaliaríamos se há passos internos pendentes
    if (currentSlide < frames.length - 1) {
      updateState(currentSlide + 1, 1);
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      updateState(currentSlide - 1, 1);
    }
  };

  if (!activeFrame) return <div className="p-8 text-center">Nenhum slide processado na AST.</div>;

  return (
    <div className="h-screen w-screen bg-slate-950 text-slate-100 flex flex-col font-sans overflow-hidden">
      {/* Top Header Barra de Status */}
      <header className="bg-slate-900 px-6 py-4 border-b border-slate-800 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">Modo Apresentador</span>
          <h1 className="font-semibold text-sm max-w-md truncate text-slate-400">{ast.title}</h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">Tempo Decorrido</p>
            <p className="font-mono text-xl text-emerald-400 font-bold">{formatTime(seconds)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">Slide</p>
            <p className="font-mono text-xl text-indigo-400 font-bold">{currentSlide + 1} / {frames.length}</p>
          </div>
        </div>
      </header>

      {/* Main Grid de Monitoramento */}
      <main className="flex-1 grid grid-cols-12 gap-6 p-6 overflow-hidden">
        {/* Lado Esquerdo: Slide Atual */}
        <div className="col-span-7 flex flex-col gap-3 h-full overflow-hidden">
          <p className="text-xs font-bold uppercase text-slate-500 tracking-widest">Tela Ativa no Projetor</p>
          <div className="flex-1 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl p-8 border border-slate-800 shadow-2xl flex flex-col overflow-y-auto">
            <h2 className="text-3xl font-black tracking-tight mb-1 text-slate-900 dark:text-white">{activeFrame.title}</h2>
            <h3 className="text-lg text-indigo-600 dark:text-indigo-400 font-medium mb-6">{activeFrame.subtitle}</h3>
            <div className="flex-1">
              {activeFrame.content.map((node, i) => <SlideRenderer key={i} node={node} currentStep={currentStep} theme={ast.theme} />)}
            </div>
          </div>
        </div>

        {/* Lado Direito: Preview do Próximo e Notas */}
        <div className="col-span-5 flex flex-col gap-6 h-full overflow-hidden">
          {/* Próximo Slide */}
          <div className="flex flex-col gap-3 h-[45%] overflow-hidden">
            <p className="text-xs font-bold uppercase text-slate-500 tracking-widest">Próximo Slide</p>
            <div className="flex-1 bg-slate-900/60 rounded-2xl p-6 border border-slate-800 opacity-60 flex flex-col scale-95 origin-top overflow-y-auto">
              {nextFrame ? (
                <>
                  <h2 className="text-xl font-bold mb-1">{nextFrame.title}</h2>
                  <h3 className="text-sm text-indigo-400 mb-4">{nextFrame.subtitle}</h3>
                </>
              ) : (
                <p className="m-auto text-slate-500 italic font-medium">Fim da apresentação</p>
              )}
            </div>
          </div>

          {/* Notas de Orador TeX */}
          <div className="flex flex-col gap-3 h-[55%] overflow-hidden">
            <p className="text-xs font-bold uppercase text-slate-500 tracking-widest">Notas de Suporte (Beamer Notes)</p>
            <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-5 font-sans text-slate-300 leading-relaxed overflow-y-auto">
              <p className="text-sm italic text-amber-400/90 mb-2">💡 Dica para este slide:</p>
              <p className="text-base">Explicar detalhadamente o comportamento do parser antes de exibir as equações matemáticas complexas. Focar na performance do ecossistema Go.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Barra Inferior de Controles Macro */}
      <footer className="bg-slate-900/40 border-t border-slate-800 px-6 py-4 flex justify-between items-center">
        <div className="flex gap-2">
          <kbd className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs text-slate-400 font-mono">←</kbd>
          <kbd className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs text-slate-400 font-mono">→</kbd>
          <span className="text-xs text-slate-500 my-auto ml-2">Use o teclado para navegar</span>
        </div>
        <div className="flex gap-4">
          <button onClick={handlePrev} disabled={currentSlide === 0} className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 font-medium text-sm transition-all active:scale-95 disabled:opacity-40">Slide Anterior</button>
          <button onClick={handleNext} disabled={currentSlide === frames.length - 1} className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-md shadow-indigo-600/10 active:scale-95 disabled:opacity-40">Avançar</button>
        </div>
      </footer>
    </div>
  );
};
