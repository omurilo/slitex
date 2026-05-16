import React from 'react';
import type { ThemeFrameProps } from './index';

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
  frame, slideIndex, totalSlides, presentationTitle, presentationAuthor, presentationInstitute, presentationDate, children,
}) => {
  const progress = ((slideIndex + 1) / totalSlides) * 100;
  const isTitleSlide = frame.titlePage || (!frame.title && !frame.subtitle);

  if (isTitleSlide) {
    return (
      <div className="slide-canvas" style={{ ...VARS, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif" }}>
        <div style={{ height: '6px', background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', flexShrink: 0 }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 140px', textAlign: 'center' }}>
          <div style={{ width: '60px', height: '4px', background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', borderRadius: '2px', marginBottom: '32px' }} />
          <h1 style={{ fontSize: '68px', fontWeight: 900, color: '#0f172a', margin: 0, lineHeight: 1.05, letterSpacing: '-0.03em' }}>
            {presentationTitle}
          </h1>
          {presentationAuthor && (
            <p style={{ marginTop: '24px', color: '#6366f1', fontSize: '24px', fontWeight: 500, margin: '24px 0 0' }}>{presentationAuthor}</p>
          )}
          {presentationInstitute && (
            <p style={{ marginTop: '8px', color: '#64748b', fontSize: '18px', fontWeight: 400, margin: '8px 0 0' }}>{presentationInstitute}</p>
          )}
          {presentationDate && (
            <p style={{ marginTop: '6px', color: '#94a3b8', fontSize: '16px', margin: '6px 0 0' }}>{presentationDate}</p>
          )}
          <div style={{ marginTop: '24px', color: '#6366f1', fontSize: '22px', fontWeight: 500 }}>{children}</div>
        </div>
        <div style={{ padding: '20px 72px', display: 'flex', justifyContent: 'flex-end', color: '#cbd5e1', fontSize: '14px', fontWeight: 600, letterSpacing: '0.06em', flexShrink: 0 }}>
          {slideIndex + 1} / {totalSlides}
        </div>
      </div>
    );
  }

  if (frame.plain) {
    return (
      <div className="slide-canvas" style={{ ...VARS, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif", fontSize: '26px', padding: '60px 72px' }}>
        {children}
      </div>
    );
  }

  return (
    <div className="slide-canvas" style={{ ...VARS, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff', color: '#1e293b', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif", fontSize: '26px' }}>
      {/* Accent top bar */}
      <div style={{ height: '4px', background: 'linear-gradient(90deg, #6366f1, #8b5cf6 60%, rgba(139,92,246,0))', flexShrink: 0 }} />

      {/* Header */}
      <div style={{ padding: '44px 72px 20px', flexShrink: 0 }}>
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

      {/* Separator */}
      <div style={{ height: '1px', margin: '0 72px', background: 'linear-gradient(90deg, rgba(99,102,241,0.25), rgba(99,102,241,0))', flexShrink: 0 }} />

      {/* Content */}
      <div style={{ flex: 1, padding: '20px 72px 16px', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '4px' }}>
        {children}
      </div>

      {/* Footer */}
      <div style={{ padding: '14px 72px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', color: '#94a3b8', fontSize: '13px', fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', flexShrink: 0 }}>
        <span style={{ maxWidth: '70%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{presentationTitle}</span>
        <span style={{ fontFamily: 'monospace', letterSpacing: 0 }}>{slideIndex + 1} / {totalSlides}</span>
      </div>

      {/* Progress bar */}
      <div style={{ height: '3px', background: '#f1f5f9', flexShrink: 0 }}>
        <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', transition: 'width 0.4s ease' }} />
      </div>
    </div>
  );
};
