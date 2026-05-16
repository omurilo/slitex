import React from 'react';
import type { ThemeFrameProps } from './index';

const VARS = {
  '--slide-accent': '#eb811b',
  '--slide-accent-2': '#d97706',
  '--slide-text': '#23373b',
  '--slide-text-muted': '#546e75',
  '--slide-heading': '#fafafa',
  '--slide-surface': '#f0f0f0',
  '--slide-surface-header': '#2d4a50',
  '--slide-border': '#d0d0d0',
  '--slide-code-bg': '#1a2a2e',
  '--slide-code-text': '#d4e8ec',
} as React.CSSProperties;

const CHARCOAL = '#23373b';
const ORANGE = '#eb811b';

export const ThemeMetropolisFrame: React.FC<ThemeFrameProps> = ({
  frame, slideIndex, totaslitexs, presentationTitle, presentationAuthor, presentationInstitute, presentationDate, children,
}) => {
  const progress = ((slideIndex + 1) / totaslitexs) * 100;
  const isTitleSlide = frame.titlePage || (!frame.title && !frame.subtitle);

  if (isTitleSlide) {
    return (
      <div className="slide-canvas" style={{ ...VARS, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: CHARCOAL, fontFamily: "'Helvetica Neue', Arial, sans-serif", color: '#fafafa' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', padding: '80px 120px' }}>
          <div style={{ width: '80px', height: '4px', background: ORANGE, marginBottom: '36px' }} />
          <h1 style={{ fontSize: '72px', fontWeight: 300, color: '#fafafa', margin: 0, lineHeight: 1.05, letterSpacing: '-0.01em' }}>
            {presentationTitle}
          </h1>
          {presentationAuthor && (
            <p style={{ marginTop: '24px', color: ORANGE, fontSize: '22px', fontWeight: 400, margin: '24px 0 0' }}>{presentationAuthor}</p>
          )}
          {presentationInstitute && (
            <p style={{ marginTop: '8px', color: 'rgba(255,255,255,0.65)', fontSize: '18px', fontWeight: 400, margin: '8px 0 0' }}>{presentationInstitute}</p>
          )}
          {presentationDate && (
            <p style={{ marginTop: '6px', color: 'rgba(255,255,255,0.45)', fontSize: '16px', margin: '6px 0 0' }}>{presentationDate}</p>
          )}
          <div style={{ marginTop: '28px', color: ORANGE, fontSize: '22px', fontWeight: 400 }}>{children}</div>
        </div>
        <div style={{ height: '4px', background: ORANGE }} />
      </div>
    );
  }

  if (frame.plain) {
    return (
      <div className="slide-canvas" style={{ ...VARS, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fafafa', fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: '26px', padding: '60px 64px' }}>
        {children}
      </div>
    );
  }

  return (
    <div className="slide-canvas" style={{ ...VARS, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#fafafa', color: CHARCOAL, fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: '26px' }}>
      {/* Dark header */}
      <div style={{ backgroundColor: CHARCOAL, padding: '32px 64px', flexShrink: 0 }}>
        {frame.title && (
          <h2 style={{ fontSize: '1.7em', fontWeight: 700, color: '#fafafa', margin: 0, lineHeight: 1.1, letterSpacing: '-0.01em' }}>
            {frame.title}
          </h2>
        )}
        {frame.subtitle && (
          <p style={{ fontSize: '0.8em', color: ORANGE, margin: '6px 0 0', fontWeight: 400 }}>
            {frame.subtitle}
          </p>
        )}
      </div>

      {/* Thin orange accent line */}
      <div style={{ height: '3px', background: ORANGE, flexShrink: 0 }} />

      {/* Content */}
      <div style={{ flex: 1, padding: '28px 64px', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '4px' }}>
        {children}
      </div>

      {/* Footer */}
      <div style={{ backgroundColor: CHARCOAL, padding: '14px 64px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#9cb5ba', fontSize: '13px', fontWeight: 500, flexShrink: 0 }}>
        <span>{presentationAuthor || presentationTitle}</span>
        <span style={{ fontFamily: 'monospace', color: ORANGE }}>{slideIndex + 1} / {totaslitexs}</span>
      </div>

      {/* Orange progress bar */}
      <div style={{ height: '4px', background: '#1a2a2e', flexShrink: 0 }}>
        <div style={{ height: '100%', width: `${progress}%`, background: ORANGE, transition: 'width 0.4s ease' }} />
      </div>
    </div>
  );
};
