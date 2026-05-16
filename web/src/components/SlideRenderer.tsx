import React from 'react';
import type { ContentNode, InlineContent } from '../types';
import 'katex/dist/katex.min.css';
import ReactLatex from 'react-latex-next';
import { usePresentationContext } from '../contexts/PresentationContext';

interface RendererProps {
  node: ContentNode;
  currentStep: number;
  theme: string;
}

// CSS variable defaults for contexts outside a themed canvas (e.g. ViewPresenter)
const cv = (name: string, fallback: string) => `var(${name}, ${fallback})`;

const ACCENT   = () => cv('--slide-accent', '#6366f1');
const TEXT     = () => cv('--slide-text', '#1e293b');
const MUTED    = () => cv('--slide-text-muted', '#64748b');
const SURFACE  = () => cv('--slide-surface', '#f8fafc');
const SURF_HDR = () => cv('--slide-surface-header', '#eef2ff');
const BORDER   = () => cv('--slide-border', '#e2e8f0');
const CODE_BG  = () => cv('--slide-code-bg', '#0f172a');
const CODE_TXT = () => cv('--slide-code-text', '#e2e8f0');

export const SlideRenderer: React.FC<RendererProps> = ({ node, currentStep }) => {
  const { sections } = usePresentationContext();
  const shouldShow = (overlayStr?: string): boolean => {
    if (!overlayStr) return true;
    const rangeMatch = overlayStr.match(/^(\d+)-(\d+)$/);
    if (rangeMatch) return currentStep >= parseInt(rangeMatch[1]) && currentStep <= parseInt(rangeMatch[2]);
    if (overlayStr.endsWith('-')) return currentStep >= parseInt(overlayStr.slice(0, -1));
    if (overlayStr.includes(',')) return overlayStr.split(',').some((s) => parseInt(s.trim()) === currentStep);
    return currentStep === parseInt(overlayStr);
  };

  if (node.overlay && !shouldShow(node.overlay)) {
    return <div style={{ opacity: 0, pointerEvents: 'none' }} />;
  }

  const renderInline = (inline: InlineContent[]) =>
    inline.map((el, i) => {
      if (el.overlay && !shouldShow(el.overlay)) return null;
      switch (el.type) {
        case 'bold':
          return <strong key={i} style={{ fontWeight: 800, color: cv('--slide-heading', '#0f172a') }}>{el.value}</strong>;
        case 'italic':
          return <em key={i} style={{ fontStyle: 'italic', color: MUTED() }}>{el.value}</em>;
        case 'alert':
          return <strong key={i} style={{ color: ACCENT(), fontWeight: 700 }}>{el.value}</strong>;
        case 'colored':
          return <span key={i} style={{ color: el.color }}>{el.value}</span>;
        case 'math':
          return el.value.includes('\n') || el.value.length > 30
            ? <div key={i} style={{ margin: '0.4em 0' }}><ReactLatex>{el.value}</ReactLatex></div>
            : <span key={i} style={{ margin: '0 0.1em' }}><ReactLatex>{el.value}</ReactLatex></span>;
        case 'citation':
          return <sup key={i} style={{ fontSize: '0.6em', color: MUTED(), marginLeft: '0.1em', verticalAlign: 'super' }}>[{el.value}]</sup>;
        default:
          return <span key={i}>{el.value}</span>;
      }
    });

  switch (node.type) {
    case 'richtext':
      return (
        <p style={{ fontSize: '1em', color: TEXT(), lineHeight: 1.65, margin: '0 0 0.5em' }}>
          {renderInline(node.inline || [])}
        </p>
      );

    case 'block': {
      const isTransparent = !node.title;
      return (
        <div style={{
          margin: '0.4em 0',
          borderRadius: '10px',
          overflow: 'hidden',
          border: `1px solid ${BORDER()}`,
          background: SURFACE(),
        }}>
          {node.title && (
            <div style={{
              background: SURF_HDR(),
              padding: '0.35em 0.8em',
              borderBottom: `1px solid ${BORDER()}`,
            }}>
              <span style={{ fontWeight: 700, fontSize: '0.72em', textTransform: 'uppercase', letterSpacing: '0.07em', color: ACCENT() }}>
                {node.title}
              </span>
            </div>
          )}
          <div style={{ padding: isTransparent ? '0.1em 0' : '0.5em 0.8em' }}>
            {node.children?.map((child, i) => (
              <SlideRenderer key={i} node={child} currentStep={currentStep} theme="" />
            ))}
          </div>
        </div>
      );
    }

    case 'columns':
      return (
        <div style={{ display: 'flex', gap: '2em', alignItems: 'flex-start', margin: '0.4em 0', width: '100%' }}>
          {node.children?.map((child, i) => (
            <SlideRenderer key={i} node={child} currentStep={currentStep} theme="" />
          ))}
        </div>
      );

    case 'column': {
      const flexBasis = node.width ? `${parseFloat(node.width) * 100}%` : '100%';
      return (
        <div style={{ flex: `1 1 ${flexBasis}`, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          {node.children?.map((child, i) => (
            <SlideRenderer key={i} node={child} currentStep={currentStep} theme="" />
          ))}
        </div>
      );
    }

    case 'list': {
      const Tag = node.ordered ? 'ol' : 'ul';
      return (
        <Tag style={{
          margin: '0.3em 0',
          paddingLeft: '1.4em',
          listStyleType: node.ordered ? 'decimal' : 'disc',
          color: TEXT(),
          display: 'flex',
          flexDirection: 'column',
          gap: '0.3em',
        }}>
          {node.children?.map((child, idx) => {
            const visible = shouldShow(child.overlay);
            return (
              <li key={idx} style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.2s', fontSize: '1em', lineHeight: 1.5 }}>
                {visible && <SlideRenderer node={child} currentStep={currentStep} theme="" />}
              </li>
            );
          })}
        </Tag>
      );
    }

    case 'image':
      return (
        <div style={{ margin: '0.5em 0', display: 'flex', justifyContent: 'center' }}>
          <img
            src={`/${node.path}`}
            alt="Slide"
            style={{ maxWidth: '100%', maxHeight: '42em', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}
          />
        </div>
      );

    case 'verbatim':
      return (
        <pre style={{
          margin: '0.4em 0',
          padding: '0.7em 1em',
          background: CODE_BG(),
          color: CODE_TXT(),
          borderRadius: '8px',
          fontSize: '0.7em',
          fontFamily: "'Fira Code', 'Cascadia Code', 'Courier New', monospace",
          overflowX: 'auto',
          whiteSpace: 'pre',
          lineHeight: 1.6,
        }}>
          {node.title}
        </pre>
      );

    case 'code':
      return (
        <div style={{
          margin: '0.4em 0',
          background: CODE_BG(),
          borderRadius: '10px',
          overflow: 'hidden',
        }}>
          {node.lang && (
            <div style={{
              padding: '0.3em 1em',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              fontSize: '0.6em',
              color: 'rgba(255,255,255,0.4)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontFamily: 'monospace',
            }}>
              {node.lang}
            </div>
          )}
          <pre style={{
            margin: 0,
            padding: '0.7em 1em',
            color: CODE_TXT(),
            fontSize: '0.7em',
            fontFamily: "'Fira Code', 'Cascadia Code', 'Courier New', monospace",
            overflowX: 'auto',
            whiteSpace: 'pre',
            lineHeight: 1.7,
          }}>
            <code>{node.title}</code>
          </pre>
        </div>
      );

    case 'table':
      return (
        <div style={{ margin: '0.4em 0', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85em' }}>
            <tbody>
              {node.children?.map((row, ri) => (
                <tr key={ri} style={{ background: ri === 0 ? SURF_HDR() : ri % 2 === 0 ? 'rgba(0,0,0,0.02)' : 'transparent' }}>
                  {row.children?.map((cell, ci) => (
                    <td key={ci} style={{
                      padding: '0.4em 0.8em',
                      border: `1px solid ${BORDER()}`,
                      color: TEXT(),
                      fontWeight: ri === 0 ? 600 : 400,
                    }}>
                      {renderInline(cell.inline || [])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case 'spacer':
      return <div style={{ height: '1.5em' }} />;

    case 'quote':
      return (
        <blockquote style={{
          margin: '0.5em 0',
          paddingLeft: '1em',
          borderLeft: `4px solid ${ACCENT()}`,
          fontStyle: 'italic',
          color: MUTED(),
          lineHeight: 1.65,
        }}>
          {node.children?.map((child, i) => (
            <SlideRenderer key={i} node={child} currentStep={currentStep} theme="" />
          ))}
        </blockquote>
      );

    case 'toc':
      return (
        <div style={{ margin: '0.4em 0' }}>
          <ol style={{ paddingLeft: '1.4em', color: TEXT(), lineHeight: 1.9 }}>
            {sections.map((s, i) => (
              <li key={i} style={{ fontSize: '1.1em' }}>{s.title}</li>
            ))}
          </ol>
        </div>
      );

    default:
      return null;
  }
};
