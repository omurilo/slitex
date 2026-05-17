import React from 'react';
import type { ThemeFrameProps } from './index';
import { ContentScaler } from '../components/ContentScaler';

const DARK  = '#1a3a6b';
const MID   = '#254e99';
const LIGHT = '#4a7fd4';
const WHITE = '#ffffff';

const VARS = {
  '--slide-accent':         DARK,
  '--slide-accent-2':       LIGHT,
  '--slide-text':           '#1a1a2e',
  '--slide-text-muted':     '#4a5888',
  '--slide-heading':        DARK,
  '--slide-surface':        '#f0f3fb',
  '--slide-surface-header': MID,
  '--slide-border':         '#b0c4e4',
  '--slide-code-bg':        '#0c1a35',
  '--slide-code-text':      '#c4d4f8',
} as React.CSSProperties;

const MiniFrames: React.FC<{ total: number; current: number }> = ({ total, current }) => {
  const max = Math.min(total, 20);
  return (
    <div style={{ display: 'flex', gap: '0.15em', alignItems: 'center', flexWrap: 'nowrap' }}>
      {Array.from({ length: max }).map((_, i) => {
        const slideIdx = Math.round((i / Math.max(max - 1, 1)) * (total - 1));
        const active = current >= slideIdx && (i === max - 1 || current < Math.round(((i + 1) / Math.max(max - 1, 1)) * (total - 1)));
        return (
          <div key={i} style={{
            width:   '0.46em',
            height:  active ? '0.46em' : '0.3em',
            border:  `0.04em solid ${active ? WHITE : 'rgba(255,255,255,0.35)'}`,
            background: active ? WHITE : 'transparent',
            flexShrink: 0,
            transition: 'all 0.25s',
          }} />
        );
      })}
    </div>
  );
};

export const ThemeBerlinFrame: React.FC<ThemeFrameProps> = ({
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
        <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.5em 2em', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <MiniFrames total={totaslitexs} current={slideIndex} />
          <span style={{ fontSize: '0.46em', fontFamily: 'monospace', opacity: 0.65 }}>{slideIndex + 1} / {totaslitexs}</span>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5em 4em', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.6em', fontWeight: 700, color: WHITE, margin: 0, lineHeight: 1.1 }}>{presentationTitle}</h1>
          {presentationSubtitle && <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.08em', margin: '0.5em 0 0' }}>{presentationSubtitle}</p>}
          <div style={{ width: '2.5em', height: '0.12em', background: LIGHT, margin: '0.9em auto' }} />
          {presentationAuthor    && <p style={{ color: 'rgba(255,255,255,0.9)',  fontSize: '0.85em', margin: '0 0 0.2em' }}>{presentationAuthor}</p>}
          {presentationInstitute && <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.68em', margin: '0 0 0.2em', whiteSpace: 'pre-line' }}>{presentationInstitute}</p>}
          {presentationDate      && <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.6em',  margin: 0 }}>{presentationDate}</p>}
          <div style={{ marginTop: '0.7em', color: 'rgba(255,255,255,0.88)' }}>{children}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="slide-canvas" style={{ ...VARS, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: WHITE, color: '#1a1a2e', fontFamily: "Arial, Helvetica, sans-serif" }}>
      
      <div style={{ background: DARK, padding: '0.42em 2em', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <span style={{ color: 'rgba(255,255,255,0.72)', fontSize: '0.44em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '45%' }}>{presentationTitle}</span>
        <MiniFrames total={totaslitexs} current={slideIndex} />
      </div>
      
      {frame.title && (
        <div style={{ background: MID, padding: '0.65em 2em', flexShrink: 0 }}>
          <h2 style={{ fontSize: '1.58em', fontWeight: 700, color: WHITE, margin: 0, lineHeight: 1.1 }}>{frame.title}</h2>
          {frame.subtitle && <p style={{ fontSize: '0.73em', color: 'rgba(255,255,255,0.85)', margin: '0.18em 0 0' }}>{frame.subtitle}</p>}
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
      
      <div style={{ height: '0.1em', background: '#d0d8f0', flexShrink: 0 }}>
        <div style={{ height: '100%', width: `${progress}%`, background: LIGHT, transition: 'width 0.4s ease' }} />
      </div>
    </div>
  );
};
