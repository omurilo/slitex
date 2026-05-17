import React from 'react';
import type { ThemeFrameProps } from './index';
import { ContentScaler } from '../components/ContentScaler';

const MAIZE = '#FFCB05';
const MBLUE = '#00274C';
const MID   = '#00407a';
const WHITE = '#ffffff';
const BG    = '#fafcff';

const VARS = {
  '--slide-accent':         MBLUE,
  '--slide-accent-2':       MID,
  '--slide-text':           '#1a1a2e',
  '--slide-text-muted':     '#445577',
  '--slide-heading':        MBLUE,
  '--slide-surface':        '#f0f4fb',
  '--slide-surface-header': MBLUE,
  '--slide-border':         '#c0cce0',
  '--slide-code-bg':        '#001024',
  '--slide-code-text':      '#d0dff0',
} as React.CSSProperties;

export const ThemeAnnArborFrame: React.FC<ThemeFrameProps> = ({
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
      <div className="slide-canvas" style={{ ...VARS, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: MBLUE, fontFamily: "Arial, Helvetica, sans-serif", color: WHITE }}>
        
        <div style={{ height: '0.5em', background: MAIZE, flexShrink: 0 }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5em 4em', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.6em', fontWeight: 700, color: MAIZE, margin: 0, lineHeight: 1.1 }}>{presentationTitle}</h1>
          {presentationSubtitle && <p style={{ color: 'rgba(255,255,255,0.88)', fontSize: '1.08em', margin: '0.5em 0 0', fontStyle: 'italic' }}>{presentationSubtitle}</p>}
          <div style={{ width: '3em', height: '0.08em', background: MAIZE, margin: '1em auto', opacity: 0.5 }} />
          {presentationAuthor    && <p style={{ color: 'rgba(255,255,255,0.9)',  fontSize: '0.85em', margin: '0 0 0.2em' }}>{presentationAuthor}</p>}
          {presentationInstitute && <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.68em', margin: '0 0 0.2em', whiteSpace: 'pre-line' }}>{presentationInstitute}</p>}
          {presentationDate      && <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.6em',  margin: 0 }}>{presentationDate}</p>}
          <div style={{ marginTop: '0.7em', color: MAIZE }}>{children}</div>
        </div>
        
        <div style={{ height: '0.5em', background: MAIZE, flexShrink: 0 }} />
      </div>
    );
  }

  return (
    <div className="slide-canvas" style={{ ...VARS, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: BG, color: '#1a1a2e', fontFamily: "Arial, Helvetica, sans-serif" }}>
      
      <div style={{ background: MBLUE, flexShrink: 0 }}>
        <div style={{ height: '0.28em', background: MAIZE }} />
        <div style={{ padding: '0.38em 2em', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.44em', maxWidth: '60%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{presentationTitle}</span>
          <span style={{ color: MAIZE, fontSize: '0.44em', fontFamily: 'monospace', flexShrink: 0 }}>{slideIndex + 1} / {totaslitexs}</span>
        </div>
      </div>
      
      {frame.title && (
        <div style={{ padding: '0.75em 2em 0.55em', borderBottom: '0.06em solid #d0daf0', flexShrink: 0 }}>
          <h2 style={{ fontSize: '1.65em', fontWeight: 700, color: MBLUE, margin: 0, lineHeight: 1.1 }}>{frame.title}</h2>
          {frame.subtitle && <p style={{ fontSize: '0.74em', color: MID, margin: '0.18em 0 0', fontStyle: 'italic' }}>{frame.subtitle}</p>}
        </div>
      )}
      
      <ContentScaler style={{ flex: 1, padding: '0.9em 2em' }}>
        {children}
      </ContentScaler>
      
      <div style={{ background: MBLUE, flexShrink: 0 }}>
        <div style={{ padding: '0.35em 2em', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'rgba(255,255,255,0.7)', fontSize: '0.44em' }}>
          <span style={{ maxWidth: '38%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{presentationAuthor}</span>
          <span style={{ maxWidth: '38%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'center' }}>{presentationTitle}</span>
          <span style={{ color: MAIZE, fontFamily: 'monospace', flexShrink: 0 }}>{slideIndex + 1} / {totaslitexs}</span>
        </div>
        <div style={{ height: '0.25em', background: MAIZE }} />
      </div>
      
      <div style={{ height: '0.1em', background: '#d0daf0', flexShrink: 0 }}>
        <div style={{ height: '100%', width: `${progress}%`, background: MBLUE, transition: 'width 0.4s ease' }} />
      </div>
    </div>
  );
};
