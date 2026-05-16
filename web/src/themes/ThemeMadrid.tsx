import React from 'react';
import type { ThemeFrameProps } from './index';

const VARS = {
  '--slide-accent': '#104f55',
  '--slide-accent-2': '#32746d',
  '--slide-text': '#1a1a2e',
  '--slide-text-muted': '#4a5568',
  '--slide-heading': '#ffffff',
  '--slide-surface': '#f0f7f4',
  '--slide-surface-header': '#1a6b72',
  '--slide-border': '#c3dfe0',
  '--slide-code-bg': '#0d2b2e',
  '--slide-code-text': '#d4eae8',
} as React.CSSProperties;

const TEAL_DARK = '#104f55';
const TEAL_MID = '#32746d';
const TEAL_LIGHT = '#4a9e99';

const Dots: React.FC<{ total: number; current: number }> = ({ total, current }) => (
  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
    {Array.from({ length: total }).map((_, i) => (
      <div key={i} style={{ width: i === current ? '18px' : '7px', height: '7px', borderRadius: '4px', background: i === current ? '#ffffff' : 'rgba(255,255,255,0.4)', transition: 'all 0.3s ease' }} />
    ))}
  </div>
);

export const ThemeMadridFrame: React.FC<ThemeFrameProps> = ({
  frame, slideIndex, totaslitexs, presentationTitle, presentationAuthor, presentationInstitute, presentationDate, children,
}) => {
  const isTitleSlide = frame.titlePage || (!frame.title && !frame.subtitle);

  if (isTitleSlide) {
    return (
      <div className="slide-canvas" style={{ ...VARS, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: `linear-gradient(135deg, ${TEAL_DARK} 0%, ${TEAL_MID} 100%)`, fontFamily: "Georgia, 'Times New Roman', serif", color: 'white' }}>
        {/* Nav bar */}
        <div style={{ padding: '20px 60px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', flexShrink: 0 }}>
          <span style={{ fontSize: '14px', fontFamily: 'sans-serif', fontWeight: 500, letterSpacing: '0.05em', opacity: 0.9 }}>{presentationAuthor}</span>
          <Dots total={Math.min(totaslitexs, 12)} current={slideIndex} />
          <span style={{ fontSize: '14px', fontFamily: 'monospace', opacity: 0.7 }}>{slideIndex + 1} / {totaslitexs}</span>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 120px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '64px', fontWeight: 700, color: 'white', margin: 0, lineHeight: 1.1, textShadow: '0 2px 20px rgba(0,0,0,0.3)' }}>
            {presentationTitle}
          </h1>
          <div style={{ width: '80px', height: '2px', background: 'rgba(255,255,255,0.5)', margin: '24px auto' }} />
          {presentationAuthor && (
            <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '22px', fontFamily: 'sans-serif', margin: '0 0 6px' }}>{presentationAuthor}</p>
          )}
          {presentationInstitute && (
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '18px', fontFamily: 'sans-serif', margin: '0 0 6px' }}>{presentationInstitute}</p>
          )}
          {presentationDate && (
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '16px', fontFamily: 'sans-serif', margin: 0 }}>{presentationDate}</p>
          )}
          <div style={{ marginTop: '18px', color: 'rgba(255,255,255,0.85)', fontSize: '22px', fontFamily: 'sans-serif' }}>{children}</div>
        </div>
      </div>
    );
  }

  if (frame.plain) {
    return (
      <div className="slide-canvas" style={{ ...VARS, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff', fontFamily: "Georgia, 'Times New Roman', serif", fontSize: '26px', padding: '60px' }}>
        {children}
      </div>
    );
  }

  return (
    <div className="slide-canvas" style={{ ...VARS, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff', color: '#1a1a2e', fontFamily: "Georgia, 'Times New Roman', serif", fontSize: '26px' }}>
      {/* Top bar: dark teal with presentation meta */}
      <div style={{ background: `linear-gradient(90deg, ${TEAL_DARK}, ${TEAL_MID})`, padding: '16px 60px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', fontFamily: 'sans-serif', fontWeight: 500 }}>{presentationTitle}</span>
        <Dots total={Math.min(totaslitexs, 12)} current={slideIndex} />
        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontFamily: 'sans-serif' }}>{presentationAuthor}</span>
      </div>

      {/* Slide title band */}
      {frame.title && (
        <div style={{ background: `linear-gradient(90deg, ${TEAL_MID}, ${TEAL_LIGHT})`, padding: '20px 60px', flexShrink: 0 }}>
          <h2 style={{ fontSize: '1.5em', fontWeight: 700, color: 'white', margin: 0, lineHeight: 1.1, textShadow: '0 1px 4px rgba(0,0,0,0.2)' }}>
            {frame.title}
          </h2>
          {frame.subtitle && (
            <p style={{ fontSize: '0.75em', color: 'rgba(255,255,255,0.9)', margin: '6px 0 0', fontFamily: 'sans-serif', fontWeight: 400 }}>
              {frame.subtitle}
            </p>
          )}
        </div>
      )}

      {/* Content */}
      <div style={{ flex: 1, padding: '28px 60px', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '4px' }}>
        {children}
      </div>

      {/* Footer */}
      <div style={{ background: `linear-gradient(90deg, ${TEAL_DARK}, ${TEAL_MID})`, padding: '12px 60px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'rgba(255,255,255,0.8)', fontSize: '12px', fontFamily: 'sans-serif', fontWeight: 500, flexShrink: 0 }}>
        <span>{presentationAuthor}</span>
        <span style={{ maxWidth: '50%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'center' }}>{presentationTitle}</span>
        <span style={{ fontFamily: 'monospace' }}>{slideIndex + 1} / {totaslitexs}</span>
      </div>
    </div>
  );
};
