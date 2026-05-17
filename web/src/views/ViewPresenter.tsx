import React, { useState, useEffect, useCallback, useRef } from 'react';
import { type PresentationAST } from '../types';
import { useSyncSlides } from '../hooks/useSyncSlides';
import { ViewProjector } from './ViewProjector';

interface PresenterProps {
  ast: PresentationAST;
  initiaslitex?: number;
}

export const ViewPresenter: React.FC<PresenterProps> = ({ ast, initiaslitex = 0 }) => {
  const { currentSlide, currentStep, updateState } = useSyncSlides(initiaslitex);
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

  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 50) { if (dx < 0) handleNext(); else handlePrev(); }
  };

  if (!activeFrame) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0d0d0d', color: 'rgba(255,255,255,0.4)', fontFamily: 'sans-serif' }}>
      Nenhum slide processado na AST.
    </div>
  );

  const atStart = currentSlide === 0 && currentStep === 1;
  const atEnd = currentSlide === frames.length - 1 && currentStep >= (activeFrame.maxSteps ?? 1);

  return (
    <div
      style={{ height: '100vh', width: '100vw', background: '#0d0d0d', display: 'flex', flexDirection: 'column', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', overflow: 'hidden', color: '#fff' }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      
      <header style={{ height: 52, flexShrink: 0, background: '#141414', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <span style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.22)', textTransform: 'uppercase' as const }}>slitex</span>
          <span style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />
          <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: 'rgba(99,102,241,0.15)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.25)', letterSpacing: '0.04em', flexShrink: 0 }}>presenter</span>
          {ast.title && <>
            <span style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 300 }}>{ast.title}</span>
          </>}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexShrink: 0 }}>
          <div style={{ textAlign: 'center' as const }}>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginBottom: 1 }}>tempo</div>
            <div style={{ fontFamily: 'monospace', fontSize: 20, fontWeight: 700, color: '#4ade80', lineHeight: 1 }}>{formatTime(seconds)}</div>
          </div>
          <span style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ textAlign: 'center' as const }}>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginBottom: 1 }}>slide</div>
            <div style={{ fontFamily: 'monospace', fontSize: 20, fontWeight: 700, color: '#818cf8', lineHeight: 1 }}>
              {currentSlide + 1}<span style={{ fontSize: 13, color: 'rgba(255,255,255,0.2)', fontWeight: 400 }}> / {frames.length}</span>
            </div>
          </div>
          {(activeFrame.maxSteps ?? 1) > 1 && <>
            <span style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.08)' }} />
            <div style={{ textAlign: 'center' as const }}>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginBottom: 1 }}>step</div>
              <div style={{ fontFamily: 'monospace', fontSize: 20, fontWeight: 700, color: '#f59e0b', lineHeight: 1 }}>
                {currentStep}<span style={{ fontSize: 13, color: 'rgba(255,255,255,0.2)', fontWeight: 400 }}> / {activeFrame.maxSteps}</span>
              </div>
            </div>
          </>}
        </div>
      </header>

      
      <main style={{ flex: 1, display: 'flex', gap: 14, padding: 14, overflow: 'hidden', minHeight: 0 }}>

        
        <div style={{ flex: '0 0 63%', display: 'flex', flexDirection: 'column', gap: 8, minHeight: 0 }}>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.2)', flexShrink: 0 }}>Projetor ativo</span>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 0 }}>
            <div style={{ width: '100%', aspectRatio: '16/9', borderRadius: 8, overflow: 'hidden', boxShadow: '0 4px 32px rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <ViewProjector ast={ast} />
            </div>
          </div>
        </div>

        
        <div style={{ flex: '1 1 37%', display: 'flex', flexDirection: 'column', gap: 12, overflow: 'hidden', minWidth: 0 }}>

          
          <div style={{ flexShrink: 0, background: '#141414', borderRadius: 10, border: '1px solid rgba(255,255,255,0.07)', padding: '12px 14px' }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.2)', display: 'block', marginBottom: 8 }}>Próximo slide</span>
            {nextFrame ? (
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.6)', lineHeight: 1.3, marginBottom: 3 }}>{nextFrame.title || '—'}</div>
                {nextFrame.subtitle && <div style={{ fontSize: 12, color: '#818cf8', marginBottom: 4 }}>{nextFrame.subtitle}</div>}
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', lineHeight: 1.5 }}>
                  {nextFrame.content.flatMap(n => n.inline ?? []).map(il => il.value).join(' ').slice(0, 140)}
                </div>
              </div>
            ) : (
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', fontStyle: 'italic' }}>Fim da apresentação</span>
            )}
          </div>

          
          <div style={{ flex: 1, background: '#141414', borderRadius: 10, border: '1px solid rgba(255,255,255,0.07)', padding: '12px 14px', display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.2)', display: 'block', marginBottom: 8, flexShrink: 0 }}>Notas</span>
            <div style={{ flex: 1, overflowY: 'auto' as const }}>
              {activeFrame.notes ? (
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, whiteSpace: 'pre-wrap', margin: 0 }}>{activeFrame.notes}</p>
              ) : (
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', fontStyle: 'italic' }}>Sem notas para este slide.</span>
              )}
            </div>
          </div>
        </div>
      </main>

      
      <footer style={{ height: 52, flexShrink: 0, background: '#141414', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {['←', '→'].map(k => (
            <span key={k} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22, borderRadius: 4, border: '1px solid rgba(255,255,255,0.14)', background: 'rgba(255,255,255,0.05)', fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{k}</span>
          ))}
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', marginLeft: 6 }}>ou use os botões</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={handlePrev}
            disabled={atStart}
            style={{ padding: '6px 18px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.06)', color: atStart ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.65)', fontSize: 13, cursor: atStart ? 'default' : 'pointer', fontWeight: 500 }}
            onMouseEnter={e => { if (!atStart) { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; } }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = atStart ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.65)'; }}
          >← Anterior</button>
          <button
            onClick={handleNext}
            disabled={atEnd}
            style={{ padding: '6px 18px', borderRadius: 8, border: 'none', background: atEnd ? 'rgba(99,102,241,0.35)' : '#6366f1', color: atEnd ? 'rgba(255,255,255,0.3)' : '#fff', fontSize: 13, cursor: atEnd ? 'default' : 'pointer', fontWeight: 600 }}
            onMouseEnter={e => { if (!atEnd) e.currentTarget.style.background = '#4f46e5'; }}
            onMouseLeave={e => { e.currentTarget.style.background = atEnd ? 'rgba(99,102,241,0.35)' : '#6366f1'; }}
          >Avançar →</button>
        </div>
      </footer>
    </div>
  );
};
