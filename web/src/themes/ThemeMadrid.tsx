import React from 'react';
import type { ThemeFrameProps } from './index';
import { ContentScaler } from '../components/ContentScaler';

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

const SlideProgress: React.FC<{ total: number; current: number }> = ({ total, current }) => {
  if (total > 25) {
    const pct = ((current + 1) / total) * 100;
    return (
      <div style={{ display: 'flex', alignItems: 'center', minWidth: '4.62em' }}>
        <div style={{ width: '4.62em', height: '0.12em', background: 'rgba(255,255,255,0.2)', borderRadius: '0.08em' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: '#ffffff', borderRadius: '0.08em', transition: 'width 0.3s ease' }} />
        </div>
      </div>
    );
  }
  const dotW = total > 16 ? '0.19em' : '0.27em';
  const actW = total > 16 ? '0.38em' : '0.69em';
  const dotH = total > 16 ? '0.19em' : '0.27em';
  const gap  = total > 16 ? '0.15em' : '0.23em';
  return (
    <div style={{ display: 'flex', gap, alignItems: 'center', flexWrap: 'nowrap' }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          width: i === current ? actW : dotW,
          height: dotH,
          borderRadius: '0.15em',
          background: i === current ? '#ffffff' : 'rgba(255,255,255,0.4)',
          transition: 'all 0.3s ease',
          flexShrink: 0,
        }} />
      ))}
    </div>
  );
};

export const ThemeMadridFrame: React.FC<ThemeFrameProps> = ({
  frame, slideIndex, totaslitexs, presentationTitle, presentationSubtitle, presentationAuthor, presentationInstitute, presentationDate, children,
}) => {
  if (frame.plain) {
    return (
      <div className="slide-canvas" style={{ ...VARS, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff', fontFamily: "Georgia, 'Times New Roman', serif", padding: '2.31em' }}>
        {children}
      </div>
    );
  }

  const isTitleSlide = frame.titlePage;

  if (isTitleSlide) {
    return (
      <div className="slide-canvas" style={{ ...VARS, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: `linear-gradient(135deg, ${TEAL_DARK} 0%, ${TEAL_MID} 100%)`, fontFamily: "Georgia, 'Times New Roman', serif", color: 'white' }}>
        <div style={{ padding: '0.77em 2.31em', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', flexShrink: 0 }}>
          <span style={{ fontSize: '0.54em', fontFamily: 'sans-serif', fontWeight: 500, letterSpacing: '0.05em', opacity: 0.9 }}>{presentationAuthor}</span>
          <SlideProgress total={totaslitexs} current={slideIndex} />
          <span style={{ fontSize: '0.54em', fontFamily: 'monospace', opacity: 0.7 }}>{slideIndex + 1} / {totaslitexs}</span>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2.31em 4.62em', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.46em', fontWeight: 700, color: 'white', margin: 0, lineHeight: 1.1, textShadow: '0 2px 20px rgba(0,0,0,0.3)' }}>
            {presentationTitle}
          </h1>
          {presentationSubtitle && (
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.08em', fontFamily: 'sans-serif', margin: '0.54em 0 0', fontStyle: 'italic' }}>{presentationSubtitle}</p>
          )}
          <div style={{ width: '3.08em', height: '0.08em', background: 'rgba(255,255,255,0.5)', margin: '0.92em auto' }} />
          {presentationAuthor && (
            <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.85em', fontFamily: 'sans-serif', margin: '0 0 0.23em' }}>{presentationAuthor}</p>
          )}
          {presentationInstitute && (
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.69em', fontFamily: 'sans-serif', margin: '0 0 0.23em', whiteSpace: 'pre-line' }}>{presentationInstitute}</p>
          )}
          {presentationDate && (
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.62em', fontFamily: 'sans-serif', margin: 0 }}>{presentationDate}</p>
          )}
          <div style={{ marginTop: '0.69em', color: 'rgba(255,255,255,0.85)', fontSize: '0.85em', fontFamily: 'sans-serif' }}>{children}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="slide-canvas" style={{ ...VARS, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff', color: '#1a1a2e', fontFamily: "Georgia, 'Times New Roman', serif" }}>
      
      <div style={{ background: `linear-gradient(90deg, ${TEAL_DARK}, ${TEAL_MID})`, padding: '0.62em 2.31em', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.54em', fontFamily: 'sans-serif', fontWeight: 500 }}>{presentationTitle}</span>
        <SlideProgress total={totaslitexs} current={slideIndex} />
        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.5em', fontFamily: 'sans-serif' }}>{presentationAuthor}</span>
      </div>

      
      {frame.title && (
        <div style={{ background: `linear-gradient(90deg, ${TEAL_MID}, ${TEAL_LIGHT})`, padding: '0.77em 2.31em', flexShrink: 0 }}>
          <h2 style={{ fontSize: '1.5em', fontWeight: 700, color: 'white', margin: 0, lineHeight: 1.1, textShadow: '0 1px 4px rgba(0,0,0,0.2)' }}>
            {frame.title}
          </h2>
          {frame.subtitle && (
            <p style={{ fontSize: '0.75em', color: 'rgba(255,255,255,0.9)', margin: '0.23em 0 0', fontFamily: 'sans-serif', fontWeight: 400 }}>
              {frame.subtitle}
            </p>
          )}
        </div>
      )}

      
      <ContentScaler style={{ flex: 1, padding: '1.08em 2.31em' }}>
        {children}
      </ContentScaler>

      
      <div style={{ background: `linear-gradient(90deg, ${TEAL_DARK}, ${TEAL_MID})`, padding: '0.46em 2.31em', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'rgba(255,255,255,0.8)', fontSize: '0.46em', fontFamily: 'sans-serif', fontWeight: 500, flexShrink: 0 }}>
        <span>{presentationAuthor}</span>
        <span style={{ maxWidth: '50%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'center' }}>{presentationTitle}</span>
        <span style={{ fontFamily: 'monospace' }}>{slideIndex + 1} / {totaslitexs}</span>
      </div>
    </div>
  );
};
