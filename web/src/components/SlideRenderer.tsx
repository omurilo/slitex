import React from 'react';
import type { ContentNode, InlineContent } from '../types';
import 'katex/dist/katex.min.css';
import ReactLatex from 'react-latex-next'

interface RendererProps {
  node: ContentNode;
  currentStep: number;
  theme: string;
}

export const SlideRenderer: React.FC<RendererProps> = ({ node, currentStep, theme }) => {
  // Avaliação se o elemento deve estar visível com base no overlay mapeado pelo Go
  // Ex: "2-" significa visível a partir do step 2. "3" significa visível apenas no step 3.
  const shouldShow = (overlayStr?: string): boolean => {
    if (!overlayStr) return true;
    if (overlayStr.endsWith('-')) {
      const step = parseInt(overlayStr.slice(0, -1), 10);
      return currentStep >= step;
    }
    const step = parseInt(overlayStr, 10);
    return currentStep === step;
  };

  if (node.overlay && !shouldShow(node.overlay)) {
    return <div className="opacity-0 pointer-events-none transition-opacity duration-300" />;
  }

  const renderInline = (inline: InlineContent[]) => {
    return inline.map((el, i) => {
      if (el.overlay && !shouldShow(el.overlay)) return null;

      switch (el.type) {
        case 'bold':
          return <strong key={i} className="font-extrabold text-slate-900 dark:text-white">{el.value}</strong>;
        case 'italic':
          return <em key={i} className="italic text-slate-700 dark:text-slate-300">{el.value}</em>;
        case 'math':
          // Se contiver quebras de linha ou comandos pesados, renderiza em bloco, senão inline
          return el.value.includes('\\nu') || el.value.length > 30
            ? <div key={i} className="my-4 math-block"><ReactLatex>{el.value}</ReactLatex></div>
            : <span key={i} className="mx-1"><ReactLatex>{el.value}</ReactLatex></span>;
        default:
          return <span key={i}>{el.value}</span>;
      }
    });
  };

  switch (node.type) {
    case 'richtext':
      return <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed mb-4">{renderInline(node.inline || [])}</p>;

    case 'block':
      const customTheme = (window as any).LSlideThemes?.[theme];
      const blockChildren = node.children?.map((child, idx) => (
        <SlideRenderer key={idx} node={child} currentStep={currentStep} theme={theme} />
      ));

      if (customTheme && customTheme.Block) {
        const CustomBlock = customTheme.Block;
        return <CustomBlock node={node}>{blockChildren}</CustomBlock>;
      }

      // Fallback padrão se o tema não sobrescrever o bloco
      return (
        <div className="my-6 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
          <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-2.5 border-b dark:border-slate-800">
            <h4 className="font-bold text-sm uppercase text-indigo-600">{node.title}</h4>
          </div>
          <div className="p-4">{blockChildren}</div>
        </div>
      );
    case 'columns':
      return (
        <div className="flex gap-8 my-6 w-full items-start">
          {node.children?.map((child, idx) => (
            <SlideRenderer key={idx} node={child} currentStep={currentStep} theme={theme} />
          ))}
        </div>
      );

    case 'column':
      // Converte larguras do LaTeX como 0.5\textwidth para flex-basis inline
      const flexBasis = node.width ? `${parseFloat(node.width) * 100}%` : '100%';
      return (
        <div style={{ flex: `1 1 ${flexBasis}` }} className="flex flex-col">
          {node.children?.map((child, idx) => (
            <SlideRenderer key={idx} node={child} currentStep={currentStep} theme={theme} />
          ))}
        </div>
      );

    case 'list':
      const Tag = node.ordered ? 'ol' : 'ul';
      return (
        <Tag className={`my-4 pl-6 space-y-2 ${node.ordered ? 'list-decimal' : 'list-disc'} text-slate-700 dark:text-slate-300`}>
          {node.children?.map((child, idx) => (
            <li key={idx}>
              <SlideRenderer node={child} currentStep={currentStep} theme={theme} />
            </li>
          ))}
        </Tag>
      );

    case 'image':
      return (
        <div className="my-4 flex justify-center">
          <img src={`http://localhost:3000/${node.path}`} alt="Slide Resource" className="max-h-[350px] rounded-lg shadow-md object-contain border dark:border-slate-800" />
        </div>
      );

    default:
      return null;
  }
};
