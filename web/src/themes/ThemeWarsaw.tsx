import React from 'react';
import type { ThemeFrameProps } from './index';
import { ContentScaler } from '../components/ContentScaler';

const NAVY   = '#1a237e';
const MID    = '#283593';
const STEEL  = '#3949ab';
const ORANGE = '#e65100';
const WHITE  = '#ffffff';

const VARS = {
  '--slide-accent':         NAVY,
  '--slide-accent-2':       STEEL,
  '--slide-text':           '#1a1a2e',
  '--slide-text-muted':     '#5c6bc0',
  '--slide-heading':        WHITE,
  '--slide-surface':        '#f0f0ff',
  '--slide-surface-header': MID,
  '--slide-border':         '#c5cae9',
  '--slide-code-bg':        '#0d0d24',
  '--slide-code-text':      '#c5cae9',
} as React.CSSProperties;

const Dots: React.FC<{ total: number; current: number }> = ({ total, current }) => {
  const count = Math.min(total, 14);
  return (
    <div style={{ display: 'flex', gap: '0.27em', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: '6em' }}>
      {Array.from({ length: count }).map((_, i) => {
        const isActive = Math.round((i / (count - 1)) * (total - 1)) === current ||
          (count === total && i === current);
        return (
          <div key={i} style={{
            width:      isActive ? '0.5em'  : '0.38em',
            height:     isActive ? '0.5em'  : '0.38em',
            borderRadius: '50%',
            background: isActive ? ORANGE   : 'rgba(255,255,255,0.38)',
            flexShrink: 0,
            transition: 'all 0.3s',
          }} />
        );
      })}
    </div>
  );
};

export const ThemeWarsawFrame: React.FC<ThemeFrameProps> = ({
  frame, slideIndex, totaslitexs,
  presentationTitle, presentationSubtitle, presentationAuthor, presentationInstitute, presentationDate,
  children,
}) => {
  if (frame.plain) {
    return (
      <div className="slide-canvas" style={{ ...VARS, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: WHITE, fontFamily: "Georgia, serif", padding: '2em' }}>
        {children}
      </div>
    );
  }

  if (frame.titlePage) {
    return (
      <div className="slide-canvas" style={{ ...VARS, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: `linear-gradient(160deg, ${NAVY} 0%, ${STEEL} 100%)`, fontFamily: "Georgia, serif", color: WHITE }}>
        
        <div style={{ padding: '0.6em 1.8em', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.28)', flexShrink: 0 }}>
          <span style={{ fontSize: '0.5em', fontFamily: 'sans-serif', opacity: 0.8 }}>{presentationAuthor}</span>
          <Dots total={totaslitexs} current={slideIndex} />
        </div>
        
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5em 4em', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.6em', fontWeight: 700, color: WHITE, margin: 0, lineHeight: 1.1, fontFamily: 'sans-serif' }}>
            {presentationTitle}
          </h1>
          {presentationSubtitle && <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.1em', fontStyle: 'italic', margin: '0.5em 0 0', fontFamily: 'sans-serif' }}>{presentationSubtitle}</p>}
          <div style={{ width: '3em', height: '0.1em', background: ORANGE, margin: '0.9em auto' }} />
          {presentationAuthor    && <p style={{ color: 'rgba(255,255,255,0.9)',  fontSize: '0.85em', margin: '0 0 0.2em', fontFamily: 'sans-serif' }}>{presentationAuthor}</p>}
          {presentationInstitute && <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.68em', margin: '0 0 0.2em', fontFamily: 'sans-serif', whiteSpace: 'pre-line' }}>{presentationInstitute}</p>}
          {presentationDate      && <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.6em',  margin: 0, fontFamily: 'sans-serif' }}>{presentationDate}</p>}
          <div style={{ marginTop: '0.7em', color: 'rgba(255,255,255,0.85)', fontFamily: 'sans-serif' }}>{children}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="slide-canvas" style={{ ...VARS, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: WHITE, color: '#1a1a2e', fontFamily: "Georgia, serif" }}>
      
      <div style={{ background: `linear-gradient(90deg, ${NAVY}, ${MID})`, padding: '0.48em 1.8em', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <span style={{ color: 'rgba(255,255,255,0.78)', fontSize: '0.48em', fontFamily: 'sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>{presentationTitle}</span>
        <Dots total={totaslitexs} current={slideIndex} />
      </div>
      
      {frame.title && (
        <div style={{ background: `linear-gradient(90deg, ${MID}, ${STEEL})`, padding: '0.7em 1.8em', flexShrink: 0 }}>
          <h2 style={{ fontSize: '1.6em', fontWeight: 700, color: WHITE, margin: 0, lineHeight: 1.1, fontFamily: 'sans-serif' }}>
            {frame.title}
          </h2>
          {frame.subtitle && <p style={{ fontSize: '0.75em', color: 'rgba(255,255,255,0.85)', margin: '0.2em 0 0', fontFamily: 'sans-serif', fontStyle: 'italic' }}>{frame.subtitle}</p>}
        </div>
      )}
      
      <ContentScaler style={{ flex: 1, padding: '0.9em 1.8em' }}>
        {children}
      </ContentScaler>
      
      <div style={{ background: `linear-gradient(90deg, ${NAVY}, ${MID})`, padding: '0.38em 1.8em', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'rgba(255,255,255,0.72)', fontSize: '0.46em', fontFamily: 'sans-serif', flexShrink: 0 }}>
        <span style={{ maxWidth: '40%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{presentationAuthor}</span>
        <span style={{ maxWidth: '40%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{presentationTitle}</span>
        <span style={{ color: ORANGE, fontFamily: 'monospace', flexShrink: 0 }}>{slideIndex + 1} / {totaslitexs}</span>
      </div>
    </div>
  );
};
