import React from 'react';
import type { PresentationAST } from '../types';
import { SlideRenderer } from '../components/SlideRenderer';

interface PrintProps {
  ast: PresentationAST;
}

export const ViewPrint: React.FC<PrintProps> = ({ ast }) => {
  const frames = ast.frames || [];

  return (
    <div className="bg-white">
      <div className="print:hidden" style={{ background: '#141414', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.22)', textTransform: 'uppercase' }}>slitex</span>
          <span style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />
          <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: 'rgba(99,102,241,0.15)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.25)' }}>export PDF</span>
          {ast.title && <>
            <span style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>{ast.title}</span>
          </>}
          <span style={{ fontSize: 11, padding: '1px 8px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.28)' }}>{frames.length} slides</span>
        </div>
        <button
          onClick={() => window.print()}
          style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 16px', fontSize: 13, borderRadius: 8, border: 'none', cursor: 'pointer', background: '#6366f1', color: '#fff', fontWeight: 600 }}
          onMouseEnter={e => { e.currentTarget.style.background = '#4f46e5'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#6366f1'; }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 6 2 18 2 18 9" />
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
            <rect x="6" y="14" width="12" height="8" />
          </svg>
          Imprimir / Exportar PDF
        </button>
      </div>

      {frames.map((frame, i) => (
        <div
          key={i}
          className="print-slide"
          style={{
            width: '297mm',
            minHeight: '167mm',
            padding: '16mm 20mm',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: 'sans-serif',
            color: '#1e293b',
            backgroundColor: 'white',
          }}
        >
          <div style={{ borderBottom: '2px solid #6366f1', paddingBottom: '8px', marginBottom: '12px' }}>
            <h2 style={{ fontSize: '24pt', fontWeight: 800, margin: 0 }}>{frame.title}</h2>
            {frame.subtitle && (
              <h3 style={{ fontSize: '14pt', color: '#6366f1', margin: '4px 0 0 0', fontWeight: 500 }}>{frame.subtitle}</h3>
            )}
          </div>
          <div style={{ flex: 1 }}>
            {frame.content.map((node, j) => (
              <SlideRenderer key={j} node={node} currentStep={999} theme={ast.theme} />
            ))}
          </div>
          <div style={{ marginTop: '8px', fontSize: '8pt', color: '#94a3b8', display: 'flex', justifyContent: 'space-between' }}>
            <span>{ast.title}</span>
            <span>{i + 1} / {frames.length}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
