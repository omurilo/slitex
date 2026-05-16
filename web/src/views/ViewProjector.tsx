import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { PresentationAST } from '../types';
import { useSyncSlides } from '../hooks/useSyncSlides';
import { SlideRenderer } from '../components/SlideRenderer';
import { builtinThemes } from '../themes';
import { PresentationContext, usePresentationContextValue } from '../contexts/PresentationContext';

interface ProjectorProps {
  ast: PresentationAST;
  initiaslitex?: number;
}

/** Renders the slide at a fixed 1920×1080 canvas and scales to fit the container. */
const SlideCanvas: React.FC<{
  slideIndex: number;
  children: React.ReactNode;
}> = ({ slideIndex, children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const { width, height } = el.getBoundingClientRect();
      setScale(Math.min(width / 1920, height / 1080));
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const canvasW = Math.round(1920 * scale);
  const canvasH = Math.round(1080 * scale);

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center overflow-hidden"
      style={{ background: '#000' }}
    >
      <div
        style={{
          width: `${canvasW}px`,
          height: `${canvasH}px`,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          key={slideIndex}
          className="slide-transition"
          style={{
            width: '1920px',
            height: '1080px',
            transformOrigin: 'top left',
            transform: `scale(${scale})`,
            position: 'absolute',
            top: 0,
            left: 0,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export const ViewProjector: React.FC<ProjectorProps> = ({ ast, initiaslitex = 0 }) => {
  const { currentSlide, currentStep, updateState } = useSyncSlides(initiaslitex);
  const [showOverview, setShowOverview] = useState(false);
  const frames = ast.frames || [];
  const activeFrame = frames[currentSlide];
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

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
      if (showOverview && e.key === 'Escape') { setShowOverview(false); return; }
      switch (e.key) {
        case 'ArrowRight': case ' ':
          e.preventDefault(); handleNext(); break;
        case 'ArrowLeft': handlePrev(); break;
        case 'ArrowDown':
          if (currentSlide < frames.length - 1) updateState(currentSlide + 1, 1); break;
        case 'ArrowUp':
          if (currentSlide > 0) updateState(currentSlide - 1, 1); break;
        case 'o': case 'O': setShowOverview((s) => !s); break;
        case 'f': case 'F':
          if (!document.fullscreenElement) document.documentElement.requestFullscreen();
          else document.exitFullscreen();
          break;
        case 'Home': updateState(0, 1); break;
        case 'End': updateState(frames.length - 1, 1); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide, currentStep, frames.length, handleNext, handlePrev, showOverview, updateState]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      if (dx < 0) handleNext();
      else handlePrev();
    }
  };

  if (!activeFrame) {
    return (
      <div className="w-full h-full bg-slate-950 flex justify-center items-center text-slate-500 font-mono">
        Aguardando frames...
      </div>
    );
  }

  // Resolve theme: builtin → external → null
  const BuiltinFrame = builtinThemes[ast.theme] ?? builtinThemes['default'];
  const ExternalTheme = (window as any).slitexThemes?.[ast.theme];
  const FrameComponent = ExternalTheme?.Frame ?? BuiltinFrame;

  const ctxValue = usePresentationContextValue(
    ast.sections ?? [],
    ast.title,
    ast.author,
    ast.institute ?? '',
    ast.date ?? '',
    ast.bibliography ?? [],
    ast.citations ?? [],
  );

  const frameContent = (
    <FrameComponent
      frame={activeFrame}
      currentStep={currentStep}
      slideIndex={currentSlide}
      totaslitexs={frames.length}
      presentationTitle={ast.title}
      presentationAuthor={ast.author}
      presentationInstitute={ast.institute ?? ''}
      presentationDate={ast.date ?? ''}
    >
      {activeFrame.content.map((node, i) => (
        <SlideRenderer key={i} node={node} currentStep={currentStep} theme={ast.theme} />
      ))}
    </FrameComponent>
  );

  return (
    <PresentationContext.Provider value={ctxValue}>
    <div
      className="w-full h-full overflow-hidden relative"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <SlideCanvas slideIndex={currentSlide}>
        {frameContent}
      </SlideCanvas>

      {/* Overview modal */}
      {showOverview && (
        <div
          className="fixed inset-0 bg-black/85 z-50 overflow-auto p-8"
          onClick={() => setShowOverview(false)}
        >
          <div className="max-w-6xl mx-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white text-2xl font-bold">Visão Geral</h2>
              <button onClick={() => setShowOverview(false)} className="text-white/50 hover:text-white text-sm">
                ESC para fechar
              </button>
            </div>
            <div className="grid grid-cols-4 gap-4 lg:grid-cols-5">
              {frames.map((frame, i) => (
                <button
                  key={i}
                  onClick={() => { updateState(i, 1); setShowOverview(false); }}
                  className={`rounded-xl p-3 text-left transition-all border-2 ${
                    i === currentSlide
                      ? 'border-indigo-500 bg-indigo-900/40'
                      : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="text-xs text-white/40 font-mono mb-1">{String(i + 1).padStart(2, '0')}</div>
                  <div className="text-white font-semibold text-sm truncate">{frame.title || '(sem título)'}</div>
                  {frame.subtitle && <div className="text-white/60 text-xs truncate mt-0.5">{frame.subtitle}</div>}
                </button>
              ))}
            </div>
            <p className="text-white/30 text-xs mt-6 text-center">O / ESC · F para tela cheia · ← → para navegar</p>
          </div>
        </div>
      )}
    </div>
    </PresentationContext.Provider>
  );
};
