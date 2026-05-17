import React from 'react';
import type { ThemeFrameProps } from './index';
import { ContentScaler } from '../components/ContentScaler';

const DARK  = '#1a4a6b';
const MID   = '#1f6891';
const LIGHT = '#2e8fbf';
const WHITE = '#ffffff';

const VARS = {
  '--slide-accent':         DARK,
  '--slide-accent-2':       LIGHT,
  '--slide-text':           '#1a2a3e',
  '--slide-text-muted':     '#4a7088',
  '--slide-heading':        DARK,
  '--slide-surface':        '#f0f6fb',
  '--slide-surface-header': MID,
  '--slide-border':         '#b0d0e8',
  '--slide-code-bg':        '#0a1a2e',
  '--slide-code-text':      '#c0ddf0',
} as React.CSSProperties;

const CircleDots: React.FC<{ total: number; current: number }> = ({ total, current }) => {
  const count = Math.min(total, 18);
  return (
    <div style={{ display: 'flex', gap: '0.3em', alignItems: 'center' }}>
      {Array.from({ length: count }).map((_, i) => {
        const slideIdx = Math.round((i / Math.max(count - 1, 1)) * (total - 1));
        const active = current >= slideIdx && (i === count - 1 || current < Math.round(((i + 1) / Math.max(count - 1, 1)) * (total - 1)));
        const past   = i < count - 1 && current > Math.round(((i + 1) / Math.max(count - 1, 1)) * (total - 1));
        return (
          <div key={i} style={{
            width:        '0.38em',
            height:       '0.38em',
            borderRadius: '50%',
            border:       `0.05em solid ${active ? WHITE : past ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.3)'}`,
            background:   active ? WHITE : past ? 'rgba(255,255,255,0.5)' : 'transparent',
            flexShrink:   0,
            transition:   'all 0.3s',
          }} />
        );
      })}
    </div>
  );
};

export const ThemeDarmstadtFrame: React.FC<ThemeFrameProps> = ({
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
      <div className="slide-canvas" style={{ ...VARS, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: `linear-gradient(150deg, ${DARK} 0%, ${MID} 100%)`, fontFamily: "Arial, Helvetica, sans-serif", color: WHITE }}>
        <div style={{ background: 'rgba(0,0,0,0.22)', padding: '0.5em 2em', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <CircleDots total={totaslitexs} current={slideIndex} />
          <span style={{ fontSize: '0.46em', fontFamily: 'monospace', opacity: 0.6 }}>{slideIndex + 1} / {totaslitexs}</span>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5em 4em', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.6em', fontWeight: 700, color: WHITE, margin: 0, lineHeight: 1.1 }}>{presentationTitle}</h1>
          {presentationSubtitle && <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.08em', margin: '0.5em 0 0', fontStyle: 'italic' }}>{presentationSubtitle}</p>}
          <div style={{ width: '2.5em', height: '0.1em', background: LIGHT, margin: '0.9em auto' }} />
          {presentationAuthor    && <p style={{ color: 'rgba(255,255,255,0.9)',  fontSize: '0.85em', margin: '0 0 0.2em' }}>{presentationAuthor}</p>}
          {presentationInstitute && <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.68em', margin: '0 0 0.2em', whiteSpace: 'pre-line' }}>{presentationInstitute}</p>}
          {presentationDate      && <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.6em',  margin: 0 }}>{presentationDate}</p>}
          <div style={{ marginTop: '0.7em', color: 'rgba(255,255,255,0.88)' }}>{children}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="slide-canvas" style={{ ...VARS, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: WHITE, color: '#1a2a3e', fontFamily: "Arial, Helvetica, sans-serif" }}>
      
      <div style={{ background: DARK, padding: '0.45em 2em', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <span style={{ color: 'rgba(255,255,255,0.72)', fontSize: '0.44em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '40%' }}>{presentationTitle}</span>
        <CircleDots total={totaslitexs} current={slideIndex} />
      </div>
      
      {frame.title && (
        <div style={{ background: MID, padding: '0.65em 2em', flexShrink: 0 }}>
          <h2 style={{ fontSize: '1.58em', fontWeight: 700, color: WHITE, margin: 0, lineHeight: 1.1 }}>{frame.title}</h2>
          {frame.subtitle && <p style={{ fontSize: '0.73em', color: 'rgba(255,255,255,0.85)', margin: '0.18em 0 0', fontStyle: 'italic' }}>{frame.subtitle}</p>}
        </div>
      )}
      
      <ContentScaler style={{ flex: 1, padding: '0.9em 2em' }}>
        {children}
      </ContentScaler>
      
      <div style={{ background: DARK, padding: '0.35em 2em', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'rgba(255,255,255,0.7)', fontSize: '0.44em', flexShrink: 0 }}>
        <span style={{ maxWidth: '38%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{presentationAuthor}</span>
        <span style={{ maxWidth: '38%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{presentationTitle}</span>
        <span style={{ color: LIGHT, fontFamily: 'monospace', flexShrink: 0 }}>{slideIndex + 1} / {totaslitexs}</span>
      </div>
      
      <div style={{ height: '0.1em', background: '#c0d8ee', flexShrink: 0 }}>
        <div style={{ height: '100%', width: `${progress}%`, background: LIGHT, transition: 'width 0.4s ease' }} />
      </div>
    </div>
  );
};
