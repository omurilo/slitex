import React from 'react';
import type { PresentationAST } from '../types';
import { useSyncSlides } from '../hooks/useSyncSlides';
import { SlideThumb } from '../components/SlideThumb';

interface OverviewProps {
  ast: PresentationAST;
}

export const ViewOverview: React.FC<OverviewProps> = ({ ast }) => {
  const { currentSlide, updateState } = useSyncSlides(0);
  const frames = ast.frames || [];

  const handleSelect = (index: number) => {
    updateState(index, 1);
  };

  return (
    <div style={{ height: '100vh', background: '#0d0d0d', display: 'flex', flexDirection: 'column', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', overflow: 'hidden' }}>

      
      <header style={{ flexShrink: 0, height: 52, background: '#141414', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <span style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.22)', textTransform: 'uppercase' as const }}>slitex</span>
          <span style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />
          <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: 'rgba(99,102,241,0.15)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.25)', flexShrink: 0 }}>overview</span>
          {ast.title && <>
            <span style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 280 }}>{ast.title}</span>
          </>}
          <span style={{ fontSize: 11, padding: '1px 8px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.28)', flexShrink: 0 }}>{frames.length} slides</span>
        </div>
        <button
          onClick={() => window.close()}
          style={{ padding: '5px 14px', fontSize: 12, borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.35)', cursor: 'pointer' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.35)'; }}
        >Fechar</button>
      </header>

      
      <div style={{ flex: 1, overflowY: 'auto' as const, padding: '28px 24px', maxWidth: 1440, margin: '0 auto', width: '100%', boxSizing: 'border-box' as const }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
          {frames.map((frame, i) => {
            const isActive = i === currentSlide;
            return (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                style={{
                  borderRadius: 10,
                  border: `2px solid ${isActive ? '#6366f1' : 'rgba(255,255,255,0.07)'}`,
                  background: '#141414',
                  boxShadow: isActive ? '0 0 0 1px rgba(99,102,241,0.3), 0 4px 24px rgba(99,102,241,0.18)' : 'none',
                  cursor: 'pointer',
                  textAlign: 'left' as const,
                  padding: 0,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column' as const,
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                }}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; } }}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; } }}
              >
                
                <div style={{ position: 'relative', width: '100%' }}>
                  <SlideThumb frame={frame} ast={ast} slideIndex={i} />

                  
                  <div style={{
                    position: 'absolute', top: 7, left: 9,
                    fontFamily: 'monospace', fontSize: 11, fontWeight: 700,
                    color: isActive ? '#fff' : 'rgba(255,255,255,0.7)',
                    background: isActive ? 'rgba(99,102,241,0.85)' : 'rgba(0,0,0,0.55)',
                    borderRadius: 4, padding: '1px 6px', lineHeight: '18px',
                    backdropFilter: 'blur(4px)',
                  }}>
                    {String(i + 1).padStart(2, '0')}
                  </div>

                  
                  {frame.notes && (
                    <div style={{
                      position: 'absolute', bottom: 7, right: 9,
                      display: 'flex', alignItems: 'center', gap: 4,
                      background: 'rgba(0,0,0,0.55)', borderRadius: 4, padding: '2px 6px',
                      backdropFilter: 'blur(4px)',
                    }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#f59e0b', flexShrink: 0 }} />
                      <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.06em', textTransform: 'uppercase' as const }}>notas</span>
                    </div>
                  )}
                </div>

                
                <div style={{
                  padding: '7px 10px',
                  borderTop: `1px solid ${isActive ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.06)'}`,
                  background: isActive ? 'rgba(99,102,241,0.06)' : 'transparent',
                }}>
                  <div style={{
                    fontSize: 12, fontWeight: 600, lineHeight: 1.35,
                    color: isActive ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.6)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {frame.title || '—'}
                  </div>
                  {frame.subtitle && (
                    <div style={{ fontSize: 10, color: isActive ? '#818cf8' : 'rgba(255,255,255,0.28)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 1 }}>
                      {frame.subtitle}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
