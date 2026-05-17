import React from 'react';
import type { ThemeFrameProps } from './index';
import { ContentScaler } from '../components/ContentScaler';

const DARK  = '#003366';
const MID   = '#004e98';
const LIGHT = '#1a6bbf';
const WHITE = '#ffffff';

const VARS = {
  '--slide-accent':         DARK,
  '--slide-accent-2':       LIGHT,
  '--slide-text':           '#1a1a2e',
  '--slide-text-muted':     '#4a6fa5',
  '--slide-heading':        DARK,
  '--slide-surface':        '#f0f4ff',
  '--slide-surface-header': MID,
  '--slide-border':         '#b8d0e8',
  '--slide-code-bg':        '#001a33',
  '--slide-code-text':      '#cce0ff',
} as React.CSSProperties;

const ProgressDots: React.FC<{ total: number; current: number }> = ({ total, current }) => {
  const count = Math.min(total, 16);
  return (
    <div style={{ display: 'flex', gap: '0.23em', alignItems: 'center' }}>
      {Array.from({ length: count }).map((_, i) => {
        const slide = Math.round((i / Math.max(count - 1, 1)) * (total - 1));
        const active = current >= slide && (i === count - 1 || current < Math.round(((i + 1) / Math.max(count - 1, 1)) * (total - 1)));
        return (
          <div key={i} style={{
            width: active ? '0.62em' : '0.35em',
            height: '0.35em',
            borderRadius: '0.18em',
            background: active ? WHITE : 'rgba(255,255,255,0.35)',
            flexShrink: 0,
            transition: 'all 0.3s',
          }} />
        );
      })}
    </div>
  );
};

export const ThemeFrankfurtFrame: React.FC<ThemeFrameProps> = ({
  frame, slideIndex, totaslitexs,
  presentationTitle, presentationSubtitle, presentationAuthor, presentationInstitute, presentationDate,
  children,
}) => {
  if (frame.plain) {
    return (
      <div className="slide-canvas" style={{ ...VARS, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: WHITE, fontFamily: "Arial, Helvetica, sans-serif", padding: '2em' }}>
        {children}
      </div>
    );
  }

  if (frame.titlePage) {
    return (
      <div className="slide-canvas" style={{ ...VARS, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: `linear-gradient(155deg, ${DARK} 0%, ${MID} 60%, ${LIGHT} 100%)`, fontFamily: "Arial, Helvetica, sans-serif", color: WHITE }}>
        <div style={{ padding: '0.55em 2em', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.22)', flexShrink: 0 }}>
          <ProgressDots total={totaslitexs} current={slideIndex} />
          <span style={{ fontSize: '0.48em', opacity: 0.75, fontFamily: 'monospace' }}>{slideIndex + 1} / {totaslitexs}</span>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', padding: '2em 3.5em' }}>
          <div style={{ width: '2.5em', height: '0.12em', background: '#7ec8e3', marginBottom: '1em' }} />
          <h1 style={{ fontSize: '2.5em', fontWeight: 700, color: WHITE, margin: 0, lineHeight: 1.1 }}>{presentationTitle}</h1>
          {presentationSubtitle && <p style={{ color: 'rgba(255,255,255,0.82)', fontSize: '1.05em', margin: '0.5em 0 0' }}>{presentationSubtitle}</p>}
          <div style={{ marginTop: '1.2em', display: 'flex', flexDirection: 'column', gap: '0.2em' }}>
            {presentationAuthor    && <p style={{ color: 'rgba(255,255,255,0.9)',  fontSize: '0.82em', margin: 0 }}>{presentationAuthor}</p>}
            {presentationInstitute && <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.65em', margin: 0, whiteSpace: 'pre-line' }}>{presentationInstitute}</p>}
            {presentationDate      && <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.58em', margin: 0 }}>{presentationDate}</p>}
          </div>
          <div style={{ marginTop: '0.8em', color: 'rgba(255,255,255,0.88)' }}>{children}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="slide-canvas" style={{ ...VARS, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: WHITE, color: '#1a1a2e', fontFamily: "Arial, Helvetica, sans-serif" }}>
      
      <div style={{ background: DARK, padding: '0.45em 2em', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.46em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '50%' }}>{presentationTitle}</span>
        <ProgressDots total={totaslitexs} current={slideIndex} />
      </div>
      
      {frame.title && (
        <div style={{ background: MID, padding: '0.65em 2em', flexShrink: 0 }}>
          <h2 style={{ fontSize: '1.55em', fontWeight: 700, color: WHITE, margin: 0, lineHeight: 1.1 }}>{frame.title}</h2>
          {frame.subtitle && <p style={{ fontSize: '0.72em', color: 'rgba(255,255,255,0.85)', margin: '0.18em 0 0' }}>{frame.subtitle}</p>}
        </div>
      )}
      
      <ContentScaler style={{ flex: 1, padding: '0.9em 2em' }}>
        {children}
      </ContentScaler>
      
      <div style={{ background: DARK, padding: '0.35em 2em', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'rgba(255,255,255,0.7)', fontSize: '0.44em', flexShrink: 0 }}>
        <span style={{ maxWidth: '38%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{presentationAuthor}</span>
        <span style={{ maxWidth: '38%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'center' }}>{presentationTitle}</span>
        <span style={{ fontFamily: 'monospace', color: '#7ec8e3', flexShrink: 0 }}>{slideIndex + 1} / {totaslitexs}</span>
      </div>
    </div>
  );
};
