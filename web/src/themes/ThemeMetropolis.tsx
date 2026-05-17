import React from 'react';
import type { ThemeFrameProps } from './index';
import { ContentScaler } from '../components/ContentScaler';

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
  frame, slideIndex, totaslitexs, presentationTitle, presentationSubtitle, presentationAuthor, presentationInstitute, presentationDate, children,
}) => {
  const progress = ((slideIndex + 1) / totaslitexs) * 100;
  if (frame.plain) {
    return (
      <div className="slide-canvas" style={{ ...VARS, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fafafa', fontFamily: "'Helvetica Neue', Arial, sans-serif", padding: '2.31em 2.46em' }}>
        {children}
      </div>
    );
  }

  const isTitleSlide = frame.titlePage;

  if (isTitleSlide) {
    return (
      <div className="slide-canvas" style={{ ...VARS, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: CHARCOAL, fontFamily: "'Helvetica Neue', Arial, sans-serif", color: '#fafafa' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', padding: '3.08em 4.62em' }}>
          <div style={{ width: '3.08em', height: '0.15em', background: ORANGE, marginBottom: '1.38em' }} />
          <h1 style={{ fontSize: '2.77em', fontWeight: 300, color: '#fafafa', margin: 0, lineHeight: 1.05, letterSpacing: '-0.01em' }}>
            {presentationTitle}
          </h1>
          {presentationSubtitle && (
            <p style={{ marginTop: '0.46em', color: '#fafafa', fontSize: '1.23em', fontWeight: 300, margin: '0.46em 0 0', opacity: 0.85 }}>{presentationSubtitle}</p>
          )}
          {presentationAuthor && (
            <p style={{ marginTop: '0.92em', color: ORANGE, fontSize: '0.85em', fontWeight: 400, margin: '0.92em 0 0' }}>{presentationAuthor}</p>
          )}
          {presentationInstitute && (
            <p style={{ marginTop: '0.31em', color: 'rgba(255,255,255,0.65)', fontSize: '0.69em', fontWeight: 400, margin: '0.31em 0 0', whiteSpace: 'pre-line' }}>{presentationInstitute}</p>
          )}
          {presentationDate && (
            <p style={{ marginTop: '0.23em', color: 'rgba(255,255,255,0.45)', fontSize: '0.62em', margin: '0.23em 0 0' }}>{presentationDate}</p>
          )}
          <div style={{ marginTop: '1.08em', color: ORANGE, fontSize: '0.85em', fontWeight: 400 }}>{children}</div>
        </div>
        <div style={{ height: '0.15em', background: ORANGE }} />
      </div>
    );
  }

  return (
    <div className="slide-canvas" style={{ ...VARS, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#fafafa', color: CHARCOAL, fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
      {/* Dark header */}
      <div style={{ backgroundColor: CHARCOAL, padding: '1.23em 2.46em', flexShrink: 0 }}>
        {frame.title && (
          <h2 style={{ fontSize: '1.7em', fontWeight: 700, color: '#fafafa', margin: 0, lineHeight: 1.1, letterSpacing: '-0.01em' }}>
            {frame.title}
          </h2>
        )}
        {frame.subtitle && (
          <p style={{ fontSize: '0.8em', color: ORANGE, margin: '0.23em 0 0', fontWeight: 400 }}>
            {frame.subtitle}
          </p>
        )}
      </div>

      {/* Thin orange accent line */}
      <div style={{ height: '0.12em', background: ORANGE, flexShrink: 0 }} />

      {/* Content */}
      <ContentScaler style={{ flex: 1, padding: '1.08em 2.46em' }}>
        {children}
      </ContentScaler>

      {/* Footer */}
      <div style={{ backgroundColor: CHARCOAL, padding: '0.54em 2.46em', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#9cb5ba', fontSize: '0.5em', fontWeight: 500, flexShrink: 0 }}>
        <span>{presentationAuthor || presentationTitle}</span>
        <span style={{ fontFamily: 'monospace', color: ORANGE }}>{slideIndex + 1} / {totaslitexs}</span>
      </div>

      {/* Orange progress bar */}
      <div style={{ height: '0.15em', background: '#1a2a2e', flexShrink: 0 }}>
        <div style={{ height: '100%', width: `${progress}%`, background: ORANGE, transition: 'width 0.4s ease' }} />
      </div>
    </div>
  );
};
