import React, { useCallback, useEffect } from 'react';
import { type PresentationAST } from '../types';
import { ViewProjector } from './ViewProjector';
import { useSyncSlides } from '../hooks/useSyncSlides';

interface LandingProps {
  ast: PresentationAST;
}

export const ViewLanding: React.FC<LandingProps> = ({ ast }) => {
  const { currentSlide, currentStep, updateState } = useSyncSlides();
  const frames = ast.frames || [];
  const totalSlides = frames.length;
  const activeFrame = frames[currentSlide];

  const handleNext = useCallback(() => {
    const maxSteps = activeFrame?.maxSteps ?? 1;
    if (currentStep < maxSteps) {
      updateState(currentSlide, currentStep + 1);
    } else if (currentSlide < totalSlides - 1) {
      updateState(currentSlide + 1, 1);
    }
  }, [currentSlide, currentStep, totalSlides, activeFrame, updateState]);

  const handlePrev = useCallback(() => {
    if (currentStep > 1) {
      updateState(currentSlide, currentStep - 1);
    } else if (currentSlide > 0) {
      updateState(currentSlide - 1, 1);
    }
  }, [currentSlide, currentStep, updateState]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLButtonElement) return;
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); handleNext(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); handlePrev(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleNext, handlePrev]);

  const openPresenterMode = () => window.open('/presenter', '_blank', 'width=1280,height=800');
  const openProjectorMode = () => window.open('/projector', '_blank', 'width=1920,height=1080,menubar=no,toolbar=no');
  const openOverview    = () => window.open('/overview', '_blank', 'width=1200,height=800');
  const openPrint       = () => window.open('/print', '_blank');

  const atStart = currentSlide === 0 && currentStep <= 1;
  const atEnd   = currentSlide === totalSlides - 1 && currentStep >= (activeFrame?.maxSteps ?? 1);

  return (
    <div style={{ minHeight: '100vh', background: '#0d0d0d', display: 'flex', flexDirection: 'column', fontFamily: 'sans-serif' }}>

      
      <header style={{
        height: 48, flexShrink: 0, background: '#141414',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <span style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.22)', textTransform: 'uppercase' }}>slitex</span>
          <span style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', flexShrink: 0 }} />
          <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.22)' }}>live</span>
          {ast.title && <>
            <span style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 320 }}>{ast.title}</span>
          </>}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          {[{ label: 'Overview', action: openOverview }, { label: 'Export PDF', action: openPrint }].map(btn => (
            <button key={btn.label} onClick={btn.action} style={{ padding: '4px 10px', fontSize: 12, borderRadius: 6, border: 'none', cursor: 'pointer', background: 'transparent', color: 'rgba(255,255,255,0.38)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'rgba(255,255,255,0.72)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.38)'; }}
            >{btn.label}</button>
          ))}
          <span style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.08)', margin: '0 4px', flexShrink: 0 }} />
          <button onClick={openPresenterMode} style={{ padding: '4px 12px', fontSize: 12, borderRadius: 6, cursor: 'pointer', background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'rgba(255,255,255,0.88)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
          >Presenter</button>
          <button onClick={openProjectorMode} style={{ padding: '4px 12px', fontSize: 12, borderRadius: 6, cursor: 'pointer', background: '#6366f1', color: '#fff', border: 'none', marginLeft: 4 }}
            onMouseEnter={e => { e.currentTarget.style.background = '#4f46e5'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#6366f1'; }}
          >Projector</button>
        </div>
      </header>

      
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 32px 28px' }}>
        <div style={{ width: '100%', maxWidth: 960, aspectRatio: '16/9', borderRadius: 10, overflow: 'hidden', boxShadow: '0 8px 48px rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <ViewProjector ast={ast} />
        </div>

        
        {(ast.author || ast.date) && (
          <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
            {ast.author && <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.28)', fontFamily: 'sans-serif' }}>{ast.author}</span>}
            {ast.author && ast.date && <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,0.18)', flexShrink: 0, display: 'inline-block' }} />}
            {ast.date && <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.28)', fontFamily: 'sans-serif' }}>{ast.date}</span>}
          </div>
        )}

        
        <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={handlePrev} disabled={atStart} style={{ width: 32, height: 32, borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', cursor: atStart ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: atStart ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.5)' }}
            onMouseEnter={e => { if (!atStart) { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; } }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = atStart ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.5)'; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          </button>

          <span style={{ fontFamily: 'monospace', fontSize: 12, color: 'rgba(255,255,255,0.3)', minWidth: 64, textAlign: 'center' }}>{currentSlide + 1} / {totalSlides}</span>

          <button onClick={handleNext} disabled={atEnd} style={{ width: 32, height: 32, borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', cursor: atEnd ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: atEnd ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.5)' }}
            onMouseEnter={e => { if (!atEnd) { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; } }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = atEnd ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.5)'; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
          </button>

          <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.14)', marginLeft: 8 }}>← →</span>
        </div>
      </main>
    </div>
  );
};
