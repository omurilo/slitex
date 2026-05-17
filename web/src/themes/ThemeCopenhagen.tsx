import React from 'react';
import type { ThemeFrameProps } from './index';
import { ContentScaler } from '../components/ContentScaler';

const NAVY  = '#1b2e5c';
const MID   = '#2a4a8c';
const LIGHT = '#3d6bbf';
const WHITE = '#ffffff';

const VARS = {
  '--slide-accent':         NAVY,
  '--slide-accent-2':       LIGHT,
  '--slide-text':           '#1a1a2e',
  '--slide-text-muted':     '#4a5580',
  '--slide-heading':        NAVY,
  '--slide-surface':        '#f2f4fb',
  '--slide-surface-header': MID,
  '--slide-border':         '#b8c4e0',
  '--slide-code-bg':        '#0d1424',
  '--slide-code-text':      '#c8d4f0',
} as React.CSSProperties;

export const ThemeCopenhagenFrame: React.FC<ThemeFrameProps> = ({
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
      <div className="slide-canvas" style={{ ...VARS, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: `linear-gradient(150deg, ${NAVY} 0%, ${MID} 100%)`, fontFamily: "Arial, Helvetica, sans-serif", color: WHITE }}>
        
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.42em 2em', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: '0.46em', opacity: 0.8 }}>{presentationAuthor}</span>
          <span style={{ fontSize: '0.46em', opacity: 0.7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '40%' }}>{presentationTitle}</span>
          <span style={{ fontSize: '0.46em', opacity: 0.6 }}>{presentationDate}</span>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5em 4em', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.6em', fontWeight: 700, color: WHITE, margin: 0, lineHeight: 1.1 }}>{presentationTitle}</h1>
          {presentationSubtitle && <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.08em', margin: '0.5em 0 0', fontStyle: 'italic' }}>{presentationSubtitle}</p>}
          <div style={{ width: '3em', height: '0.08em', background: 'rgba(255,255,255,0.45)', margin: '0.9em auto' }} />
          {presentationAuthor    && <p style={{ color: 'rgba(255,255,255,0.9)',  fontSize: '0.85em', margin: '0 0 0.2em' }}>{presentationAuthor}</p>}
          {presentationInstitute && <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.68em', margin: '0 0 0.2em', whiteSpace: 'pre-line' }}>{presentationInstitute}</p>}
          {presentationDate      && <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.6em',  margin: 0 }}>{presentationDate}</p>}
          <div style={{ marginTop: '0.7em', color: 'rgba(255,255,255,0.85)' }}>{children}</div>
        </div>
        
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.38em 2em', display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: '0.42em', opacity: 0.55, fontFamily: 'monospace' }}>{slideIndex + 1} / {totaslitexs}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="slide-canvas" style={{ ...VARS, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: WHITE, color: '#1a1a2e', fontFamily: "Arial, Helvetica, sans-serif" }}>
      
      <div style={{ background: NAVY, padding: '0.38em 2em', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.44em', maxWidth: '32%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{presentationAuthor}</span>
        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.44em', maxWidth: '36%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{presentationTitle}</span>
        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.44em', flexShrink: 0 }}>{presentationDate}</span>
      </div>
      
      {frame.title && (
        <div style={{ background: MID, padding: '0.7em 2em', flexShrink: 0 }}>
          <h2 style={{ fontSize: '1.6em', fontWeight: 700, color: WHITE, margin: 0, lineHeight: 1.1 }}>{frame.title}</h2>
          {frame.subtitle && <p style={{ fontSize: '0.74em', color: 'rgba(255,255,255,0.85)', margin: '0.18em 0 0' }}>{frame.subtitle}</p>}
        </div>
      )}
      
      <ContentScaler style={{ flex: 1, padding: '0.9em 2em' }}>
        {children}
      </ContentScaler>
      
      <div style={{ background: NAVY, padding: '0.35em 2em', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <div style={{ height: '0.08em', background: `rgba(255,255,255,0.3)`, position: 'absolute', left: 0, top: 0, width: `${progress}%` }} />
        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.44em', maxWidth: '38%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{presentationAuthor}</span>
        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.44em', maxWidth: '38%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{presentationTitle}</span>
        <span style={{ color: '#aac4ff', fontSize: '0.44em', fontFamily: 'monospace', flexShrink: 0 }}>{slideIndex + 1} / {totaslitexs}</span>
      </div>
      
      <div style={{ height: '0.12em', background: `rgba(43,74,140,0.3)`, flexShrink: 0 }}>
        <div style={{ height: '100%', width: `${progress}%`, background: LIGHT, transition: 'width 0.4s ease' }} />
      </div>
    </div>
  );
};
