import React, { useEffect } from 'react';
import type { PresentationAST } from '../types';
import { SlideThumb } from '../components/SlideThumb';

interface PrintProps {
  ast: PresentationAST;
}

export const ViewPrint: React.FC<PrintProps> = ({ ast }) => {
  const frames = ast.frames || [];

  useEffect(() => {
    type Undo = () => void;
    const undos: Undo[] = [];

    const forceVisible = (el: HTMLElement | null) => {
      if (!el) return;
      const { overflow, height } = el.style;
      el.style.overflow = 'visible';
      el.style.height = 'auto';
      undos.push(() => { el.style.overflow = overflow; el.style.height = height; });
    };

    const onBefore = () => {
      undos.length = 0;
      forceVisible(document.documentElement);
      forceVisible(document.body);
      forceVisible(document.getElementById('root'));
      forceVisible(document.querySelector<HTMLElement>('.print-outer'));
      const area = document.querySelector<HTMLElement>('.print-slides-area');
      if (area) {
        const prevFlex = area.style.flex;
        forceVisible(area);
        area.style.flex = 'none';
        undos.push(() => { area.style.flex = prevFlex; });
      }
      document.querySelectorAll<HTMLElement>('.slide-thumb-outer').forEach(el => {
        const prev = el.style.overflow;
        el.style.overflow = 'visible';
        undos.push(() => { el.style.overflow = prev; });
      });
      document.querySelectorAll<HTMLElement>('.slide-thumb-inner').forEach(el => {
        const prevTransform = el.style.transform;
        const prevPosition = el.style.position;
        el.style.transform = 'none';
        el.style.position = 'relative';
        undos.push(() => { el.style.transform = prevTransform; el.style.position = prevPosition; });
      });
      window.dispatchEvent(new Event('resize'));
    };

    const onAfter = () => {
      undos.forEach(fn => fn());
      undos.length = 0;
    };

    window.addEventListener('beforeprint', onBefore);
    window.addEventListener('afterprint', onAfter);
    return () => {
      window.removeEventListener('beforeprint', onBefore);
      window.removeEventListener('afterprint', onAfter);
    };
  }, []);

  return (
    <>
      <style>{`
        @media print {
          @page { size: 1920px 1080px; margin: 0; }
          html, body, #root {
            overflow: visible !important;
            height: auto !important;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print-toolbar    { display: none !important; }
          .print-slide-label { display: none !important; }
          .print-outer {
            height: auto !important;
            overflow: visible !important;
          }
          .print-slides-area {
            flex: none !important;
            overflow: visible !important;
            height: auto !important;
            padding: 0 !important;
            gap: 0 !important;
            align-items: stretch !important;
            background: transparent !important;
          }
          .print-slide-wrapper {
            page-break-after: always !important;
            break-after: page !important;
            width: 1920px !important;
            height: 1080px !important;
            max-width: none !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: hidden !important;
          }
          
          .slide-thumb-outer {
            width: 1920px !important;
            height: 1080px !important;
            overflow: visible !important;
            aspect-ratio: unset !important;
          }
          
          .slide-thumb-inner {
            transform: none !important;
            position: relative !important;
          }
        }
      `}</style>

      <div className="print-outer" style={{
        height: '100vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        background: '#111',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}>
        <div className="print-toolbar" style={{
          flexShrink: 0,
          background: '#141414',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 20px',
        }}>
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

        <div className="print-slides-area" style={{
          flex: 1,
          overflowY: 'auto',
          padding: '28px 0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 20,
        }}>
          {frames.map((frame, i) => (
            <div key={i} className="print-slide-wrapper" style={{
              width: '100%',
              maxWidth: 960,
              padding: '0 28px',
              boxSizing: 'border-box',
            }}>
              <div className="print-slide-label" style={{
                marginBottom: 5,
                fontSize: 11,
                color: 'rgba(255,255,255,0.25)',
                display: 'flex',
                justifyContent: 'space-between',
                fontVariantNumeric: 'tabular-nums',
              }}>
                <span>{i + 1} / {frames.length}</span>
                {frame.title && <span style={{ color: 'rgba(255,255,255,0.18)' }}>{frame.title}</span>}
              </div>
              <SlideThumb frame={frame} ast={ast} slideIndex={i} />
            </div>
          ))}
          <div style={{ height: 28 }} />
        </div>
      </div>
    </>
  );
};
