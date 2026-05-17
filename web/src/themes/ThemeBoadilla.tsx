// Boadilla — clean academic theme, blue accent header band, three-part footer.
import React from 'react';
import type { ThemeFrameProps } from './index';
import { ContentScaler } from '../components/ContentScaler';

const BLUE  = '#1a5499';
const MID   = '#2468b8';
const LIGHT = '#4a8fd4';
const WHITE = '#ffffff';
const BG    = '#fafbfe';

const VARS = {
  '--slide-accent':         BLUE,
  '--slide-accent-2':       LIGHT,
  '--slide-text':           '#1a1a2e',
  '--slide-text-muted':     '#5577aa',
  '--slide-heading':        BLUE,
  '--slide-surface':        '#eef3fb',
  '--slide-surface-header': MID,
  '--slide-border':         '#b0c8e8',
  '--slide-code-bg':        '#0d1c33',
  '--slide-code-text':      '#c4d8f8',
} as React.CSSProperties;

export const ThemeBoadillaFrame: React.FC<ThemeFrameProps> = ({
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
      <div className="slide-canvas" style={{ ...VARS, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: BG, fontFamily: "Arial, Helvetica, sans-serif", color: '#1a1a2e' }}>
        {/* Top accent line */}
        <div style={{ height: '0.4em', background: `linear-gradient(90deg, ${BLUE}, ${LIGHT})`, flexShrink: 0 }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2em 5em', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.5em', fontWeight: 700, color: BLUE, margin: 0, lineHeight: 1.1 }}>{presentationTitle}</h1>
          {presentationSubtitle && <p style={{ color: MID, fontSize: '1.05em', margin: '0.5em 0 0', fontStyle: 'italic' }}>{presentationSubtitle}</p>}
          <div style={{ width: '3em', height: '0.08em', background: LIGHT, margin: '1em auto' }} />
          {presentationAuthor    && <p style={{ color: '#2a2a4e', fontSize: '0.85em', margin: '0 0 0.2em' }}>{presentationAuthor}</p>}
          {presentationInstitute && <p style={{ color: '#556688', fontSize: '0.68em', margin: '0 0 0.2em', whiteSpace: 'pre-line' }}>{presentationInstitute}</p>}
          {presentationDate      && <p style={{ color: '#8899bb', fontSize: '0.6em',  margin: 0 }}>{presentationDate}</p>}
          <div style={{ marginTop: '0.8em', color: BLUE }}>{children}</div>
        </div>
        {/* Three-part footer */}
        <div style={{ padding: '0.5em 2em', background: '#e8f0fa', borderTop: `1px solid #c8d8ef`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.44em', color: '#5577aa', flexShrink: 0 }}>
          <span style={{ maxWidth: '33%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{presentationAuthor}</span>
          <span style={{ maxWidth: '33%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'center' }}>{presentationTitle}</span>
          <span style={{ fontFamily: 'monospace', flexShrink: 0 }}>{slideIndex + 1} / {totaslitexs}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="slide-canvas" style={{ ...VARS, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: BG, color: '#1a1a2e', fontFamily: "Arial, Helvetica, sans-serif" }}>
      {/* Top accent */}
      <div style={{ height: '0.2em', background: `linear-gradient(90deg, ${BLUE}, ${LIGHT})`, flexShrink: 0 }} />
      {/* Title header */}
      {frame.title && (
        <div style={{ padding: '0.9em 2em 0.65em', borderBottom: `0.06em solid #d0e0f4`, flexShrink: 0 }}>
          <h2 style={{ fontSize: '1.7em', fontWeight: 700, color: BLUE, margin: 0, lineHeight: 1.1 }}>{frame.title}</h2>
          {frame.subtitle && <p style={{ fontSize: '0.75em', color: MID, margin: '0.18em 0 0', fontStyle: 'italic' }}>{frame.subtitle}</p>}
        </div>
      )}
      {/* Content */}
      <ContentScaler style={{ flex: 1, padding: '0.9em 2em' }}>
        {children}
      </ContentScaler>
      {/* Three-part footer */}
      <div style={{ padding: '0.4em 2em', background: '#e8f0fa', borderTop: `1px solid #c8d8ef`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.44em', color: '#5577aa', flexShrink: 0 }}>
        <span style={{ maxWidth: '33%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{presentationAuthor}</span>
        <span style={{ maxWidth: '33%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'center' }}>{presentationTitle}</span>
        <span style={{ fontFamily: 'monospace', flexShrink: 0 }}>{slideIndex + 1} / {totaslitexs}</span>
      </div>
      {/* Progress */}
      <div style={{ height: '0.12em', background: '#d0e0f4', flexShrink: 0 }}>
        <div style={{ height: '100%', width: `${progress}%`, background: `linear-gradient(90deg, ${BLUE}, ${LIGHT})`, transition: 'width 0.4s ease' }} />
      </div>
    </div>
  );
};
