import React from 'react';
import type { ThemeFrameProps } from './index';
import { ContentScaler } from '../components/ContentScaler';

const VARS = {
  '--slide-accent': '#6366f1',
  '--slide-accent-2': '#8b5cf6',
  '--slide-text': '#1e293b',
  '--slide-text-muted': '#64748b',
  '--slide-heading': '#0f172a',
  '--slide-surface': '#f8fafc',
  '--slide-surface-header': '#eef2ff',
  '--slide-border': '#e2e8f0',
  '--slide-code-bg': '#0f172a',
  '--slide-code-text': '#e2e8f0',
} as React.CSSProperties;

export const ThemeDefaultFrame: React.FC<ThemeFrameProps> = ({
  frame, slideIndex, totaslitexs, presentationTitle, presentationSubtitle, presentationAuthor, presentationInstitute, presentationDate, children,
}) => {
  const progress = ((slideIndex + 1) / totaslitexs) * 100;
  if (frame.plain) {
    return (
      <div className="slide-canvas" style={{ ...VARS, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif", padding: '2.31em 2.77em' }}>
        {children}
      </div>
    );
  }

  const isTitleSlide = frame.titlePage;

  if (isTitleSlide) {
    return (
      <div className="slide-canvas" style={{ ...VARS, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif" }}>
        <div style={{ height: '0.23em', background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', flexShrink: 0 }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2.31em 5.38em', textAlign: 'center' }}>
          <div style={{ width: '2.31em', height: '0.15em', background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', borderRadius: '0.08em', marginBottom: '1.23em' }} />
          <h1 style={{ fontSize: '2.62em', fontWeight: 900, color: '#0f172a', margin: 0, lineHeight: 1.05, letterSpacing: '-0.03em' }}>
            {presentationTitle}
          </h1>
          {presentationSubtitle && (
            <p style={{ marginTop: '0.62em', color: '#6366f1', fontSize: '1.15em', fontWeight: 500, margin: '0.62em 0 0', letterSpacing: '-0.01em' }}>{presentationSubtitle}</p>
          )}
          {presentationAuthor && (
            <p style={{ marginTop: '0.92em', color: '#6366f1', fontSize: '0.92em', fontWeight: 500, margin: '0.92em 0 0' }}>{presentationAuthor}</p>
          )}
          {presentationInstitute && (
            <p style={{ marginTop: '0.31em', color: '#64748b', fontSize: '0.69em', fontWeight: 400, margin: '0.31em 0 0', whiteSpace: 'pre-line' }}>{presentationInstitute}</p>
          )}
          {presentationDate && (
            <p style={{ marginTop: '0.23em', color: '#94a3b8', fontSize: '0.62em', margin: '0.23em 0 0' }}>{presentationDate}</p>
          )}
          <div style={{ marginTop: '0.92em', color: '#6366f1', fontSize: '0.85em', fontWeight: 500 }}>{children}</div>
        </div>
        <div style={{ padding: '0.77em 2.77em', display: 'flex', justifyContent: 'flex-end', color: '#cbd5e1', fontSize: '0.54em', fontWeight: 600, letterSpacing: '0.06em', flexShrink: 0 }}>
          {slideIndex + 1} / {totaslitexs}
        </div>
      </div>
    );
  }

  return (
    <div className="slide-canvas" style={{ ...VARS, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff', color: '#1e293b', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif" }}>
      
      <div style={{ height: '0.15em', background: 'linear-gradient(90deg, #6366f1, #8b5cf6 60%, rgba(139,92,246,0))', flexShrink: 0 }} />

      
      <div style={{ padding: '1.69em 2.77em 0.77em', flexShrink: 0 }}>
        {frame.title && (
          <h2 style={{ fontSize: '2em', fontWeight: 800, color: '#0f172a', margin: 0, lineHeight: 1.1, letterSpacing: '-0.025em' }}>
            {frame.title}
          </h2>
        )}
        {frame.subtitle && (
          <p style={{ fontSize: '0.85em', color: '#6366f1', margin: '8px 0 0', fontWeight: 500 }}>
            {frame.subtitle}
          </p>
        )}
      </div>

      
      <div style={{ height: '0.04em', margin: '0 2.77em', background: 'linear-gradient(90deg, rgba(99,102,241,0.25), rgba(99,102,241,0))', flexShrink: 0 }} />

      
      <ContentScaler style={{ flex: 1, padding: '0.77em 2.77em 0.62em' }}>
        {children}
      </ContentScaler>

      
      <div style={{ padding: '0.54em 2.77em', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', color: '#94a3b8', fontSize: '0.5em', fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', flexShrink: 0 }}>
        <span style={{ maxWidth: '70%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{presentationTitle}</span>
        <span style={{ fontFamily: 'monospace', letterSpacing: 0 }}>{slideIndex + 1} / {totaslitexs}</span>
      </div>

      
      <div style={{ height: '0.12em', background: '#f1f5f9', flexShrink: 0 }}>
        <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', transition: 'width 0.4s ease' }} />
      </div>
    </div>
  );
};
