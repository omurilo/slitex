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
      <div className="p-4 print:hidden flex items-center gap-4 bg-slate-100 border-b">
        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium text-sm hover:bg-indigo-500 transition-colors"
        >
          Imprimir / Exportar PDF
        </button>
        <span className="text-sm text-slate-500">{frames.length} slides</span>
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
