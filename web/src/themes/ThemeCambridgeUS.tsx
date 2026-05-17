import React from 'react';
import type { ThemeFrameProps } from './index';
import { ContentScaler } from '../components/ContentScaler';

const MAROON = '#7b0000';
const RED    = '#a00000';
const GRAY   = '#666677';
const WHITE  = '#ffffff';
const BG     = '#fafafa';

const VARS = {
  '--slide-accent':         MAROON,
  '--slide-accent-2':       RED,
  '--slide-text':           '#1a1a1e',
  '--slide-text-muted':     '#666677',
  '--slide-heading':        MAROON,
  '--slide-surface':        '#f8f0f0',
  '--slide-surface-header': RED,
  '--slide-border':         '#e0c8c8',
  '--slide-code-bg':        '#1a0000',
  '--slide-code-text':      '#f0d0d0',
} as React.CSSProperties;

export const ThemeCambridgeUSFrame: React.FC<ThemeFrameProps> = ({
  frame, slideIndex, totaslitexs,
  presentationTitle, presentationSubtitle, presentationAuthor, presentationInstitute, presentationDate,
  children,
}) => {
  const progress = ((slideIndex + 1) / totaslitexs) * 100;

  if (frame.plain) {
    return (
      <div className="slide-canvas" style={{ ...VARS, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: WHITE, fontFamily: "Arial, Helvetica, sans-serif", padding: '2em' }}>
        {children}
      </div>
    );
  }

  if (frame.titlePage) {
    return (
      <div className="slide-canvas" style={{ ...VARS, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: BG, fontFamily: "Arial, Helvetica, sans-serif", color: '#1a1a1e' }}>
        
        <div style={{ height: '0.55em', background: MAROON, flexShrink: 0 }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2em 5em', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.5em', fontWeight: 700, color: MAROON, margin: 0, lineHeight: 1.1 }}>{presentationTitle}</h1>
          {presentationSubtitle && <p style={{ color: RED, fontSize: '1.05em', margin: '0.5em 0 0', fontStyle: 'italic' }}>{presentationSubtitle}</p>}
          <div style={{ width: '3em', height: '0.08em', background: '#c0a0a0', margin: '1em auto' }} />
          {presentationAuthor    && <p style={{ color: '#2a1a1a', fontSize: '0.85em', margin: '0 0 0.2em' }}>{presentationAuthor}</p>}
          {presentationInstitute && <p style={{ color: GRAY,     fontSize: '0.68em', margin: '0 0 0.2em', whiteSpace: 'pre-line' }}>{presentationInstitute}</p>}
          {presentationDate      && <p style={{ color: '#999',   fontSize: '0.6em',  margin: 0 }}>{presentationDate}</p>}
          <div style={{ marginTop: '0.8em', color: MAROON }}>{children}</div>
        </div>
        
        <div style={{ background: '#f0e8e8', borderTop: `0.06em solid #d0b0b0`, padding: '0.45em 2em', display: 'flex', justifyContent: 'space-between', fontSize: '0.44em', color: GRAY, flexShrink: 0 }}>
          <span>{presentationAuthor}</span>
          <span style={{ fontFamily: 'monospace' }}>{slideIndex + 1} / {totaslitexs}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="slide-canvas" style={{ ...VARS, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: BG, color: '#1a1a1e', fontFamily: "Arial, Helvetica, sans-serif" }}>
      
      <div style={{ background: MAROON, padding: '0.38em 2em', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.44em', maxWidth: '60%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{presentationTitle}</span>
        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.44em', fontFamily: 'monospace' }}>{slideIndex + 1} / {totaslitexs}</span>
      </div>
      
      {frame.title && (
        <div style={{ padding: '0.85em 2em 0.6em', borderBottom: '0.06em solid #e0c8c8', flexShrink: 0 }}>
          <h2 style={{ fontSize: '1.65em', fontWeight: 700, color: MAROON, margin: 0, lineHeight: 1.1 }}>{frame.title}</h2>
          {frame.subtitle && <p style={{ fontSize: '0.74em', color: RED, margin: '0.18em 0 0', fontStyle: 'italic' }}>{frame.subtitle}</p>}
        </div>
      )}
      
      <ContentScaler style={{ flex: 1, padding: '0.9em 2em' }}>
        {children}
      </ContentScaler>
      
      <div style={{ background: '#f0e8e8', borderTop: '0.06em solid #d0b0b0', padding: '0.38em 2em', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.44em', color: GRAY, flexShrink: 0 }}>
        <span style={{ maxWidth: '38%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{presentationAuthor}</span>
        <span style={{ maxWidth: '38%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'center' }}>{presentationTitle}</span>
        <span style={{ fontFamily: 'monospace', flexShrink: 0 }}>{slideIndex + 1} / {totaslitexs}</span>
      </div>
      
      <div style={{ height: '0.1em', background: '#e0c8c8', flexShrink: 0 }}>
        <div style={{ height: '100%', width: `${progress}%`, background: MAROON, transition: 'width 0.4s ease' }} />
      </div>
    </div>
  );
};
