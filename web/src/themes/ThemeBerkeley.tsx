import React from 'react';
import type { ThemeFrameProps } from './index';
import { ContentScaler } from '../components/ContentScaler';

const DARK  = '#1a237e';
const MID   = '#283593';
const GOLD  = '#c9a227';
const WHITE = '#ffffff';
const BG    = '#fafbff';

const VARS = {
  '--slide-accent':         DARK,
  '--slide-accent-2':       GOLD,
  '--slide-text':           '#1a1a2e',
  '--slide-text-muted':     '#5566aa',
  '--slide-heading':        DARK,
  '--slide-surface':        '#eef0ff',
  '--slide-surface-header': MID,
  '--slide-border':         '#c0c8f0',
  '--slide-code-bg':        '#0d0d24',
  '--slide-code-text':      '#c8ccf8',
} as React.CSSProperties;

const Sidebar: React.FC<{ title: string; total: number; current: number }> = ({ title, total, current }) => {
  const count = Math.min(total, 16);
  return (
    <div style={{
      width: '5.2em',
      flexShrink: 0,
      background: `linear-gradient(180deg, ${DARK} 0%, ${MID} 100%)`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '0.9em 0.4em',
      gap: '0.5em',
      overflow: 'hidden',
    }}>
      
      <div style={{
        color: GOLD,
        fontSize: '0.44em',
        fontWeight: 700,
        textAlign: 'center',
        lineHeight: 1.25,
        wordBreak: 'break-word',
        maxHeight: '3.5em',
        overflow: 'hidden',
      }}>
        {title}
      </div>
      
      <div style={{ width: '60%', height: '0.06em', background: GOLD, opacity: 0.6 }} />
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2em', alignItems: 'center', flex: 1, justifyContent: 'center' }}>
        {Array.from({ length: count }).map((_, i) => {
          const slideIdx = Math.round((i / Math.max(count - 1, 1)) * (total - 1));
          const active = current >= slideIdx && (i === count - 1 || current < Math.round(((i + 1) / Math.max(count - 1, 1)) * (total - 1)));
          return (
            <div key={i} style={{
              width:        active ? '0.7em' : '0.4em',
              height:       '0.15em',
              borderRadius: '0.08em',
              background:   active ? GOLD : 'rgba(255,255,255,0.3)',
              transition:   'all 0.3s',
            }} />
          );
        })}
      </div>
      
      <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.38em', fontFamily: 'monospace' }}>
        {current + 1}/{total}
      </div>
    </div>
  );
};

export const ThemeBerkeleyFrame: React.FC<ThemeFrameProps> = ({
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
      <div className="slide-canvas" style={{ ...VARS, width: '100%', height: '100%', display: 'flex', fontFamily: "Arial, Helvetica, sans-serif" }}>
        <Sidebar title={presentationTitle} total={totaslitexs} current={slideIndex} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2em 3em', background: `linear-gradient(150deg, ${DARK} 0%, ${MID} 100%)`, color: WHITE, textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.3em', fontWeight: 700, color: WHITE, margin: 0, lineHeight: 1.1 }}>{presentationTitle}</h1>
          {presentationSubtitle && <p style={{ color: 'rgba(255,255,255,0.88)', fontSize: '1.05em', margin: '0.5em 0 0', fontStyle: 'italic' }}>{presentationSubtitle}</p>}
          <div style={{ width: '2.5em', height: '0.1em', background: GOLD, margin: '0.9em auto' }} />
          {presentationAuthor    && <p style={{ color: 'rgba(255,255,255,0.9)',  fontSize: '0.82em', margin: '0 0 0.2em' }}>{presentationAuthor}</p>}
          {presentationInstitute && <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.65em', margin: '0 0 0.2em', whiteSpace: 'pre-line' }}>{presentationInstitute}</p>}
          {presentationDate      && <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.58em', margin: 0 }}>{presentationDate}</p>}
          <div style={{ marginTop: '0.7em', color: GOLD }}>{children}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="slide-canvas" style={{ ...VARS, width: '100%', height: '100%', display: 'flex', fontFamily: "Arial, Helvetica, sans-serif" }}>
      
      <Sidebar title={presentationTitle} total={totaslitexs} current={slideIndex} />
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: BG, color: '#1a1a2e', overflow: 'hidden' }}>
        
        <div style={{ height: '0.18em', background: GOLD, flexShrink: 0 }} />
        
        {frame.title && (
          <div style={{ padding: '0.75em 1.8em 0.55em', borderBottom: '0.06em solid #dde0f8', flexShrink: 0 }}>
            <h2 style={{ fontSize: '1.6em', fontWeight: 700, color: DARK, margin: 0, lineHeight: 1.1 }}>{frame.title}</h2>
            {frame.subtitle && <p style={{ fontSize: '0.74em', color: MID, margin: '0.18em 0 0', fontStyle: 'italic' }}>{frame.subtitle}</p>}
          </div>
        )}
        
        <ContentScaler style={{ flex: 1, padding: '0.9em 1.8em' }}>
          {children}
        </ContentScaler>
        
        <div style={{ background: DARK, padding: '0.35em 1.8em', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'rgba(255,255,255,0.65)', fontSize: '0.44em', flexShrink: 0 }}>
          <span style={{ maxWidth: '50%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{presentationAuthor}</span>
          <span style={{ color: GOLD, fontFamily: 'monospace', flexShrink: 0 }}>{slideIndex + 1} / {totaslitexs}</span>
        </div>
      </div>
    </div>
  );
};
