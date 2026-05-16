import React, { useEffect } from 'react';
import type { PresentationAST, Frame } from '../types';
import { useSyncSlides } from '../hooks/useSyncSlides';
import { SlideRenderer } from '../components/SlideRenderer';

interface ProjectorProps {
  ast: PresentationAST;
}

interface DynamicFrameProps {
  theme: string;
  frame: Frame;
  currentStep: number;
  children: React.ReactNode;
}

// O Renderer Dinâmico que integra o contrato de substituição estrutural de frames do tema
const DynamicFrameRenderer: React.FC<DynamicFrameProps> = ({ theme, frame, currentStep, children }) => {
  const customTheme = (window as any).LSlideThemes?.[theme];

  if (customTheme && customTheme.Frame) {
    const CustomFrame = customTheme.Frame;
    return (
      <CustomFrame frame={frame} currentStep={currentStep}>
        {children}
      </CustomFrame>
    );
  }

  // Fallback estrutural padrão (Tema padrão da aplicação)
  return (
    <div className="w-screen h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col p-16 justify-between select-none overflow-hidden aspect-video font-sans">
      <div>
        <h2 className="text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-2">{frame.title}</h2>
        <h3 className="text-2xl text-indigo-600 dark:text-indigo-400 font-medium">{frame.subtitle}</h3>
        <div className="h-[2px] w-full bg-gradient-to-r from-indigo-500/40 via-purple-500/20 to-transparent mt-6" />
      </div>

      <div className="flex-1 flex flex-col justify-center my-8">
        <div>
          {children}
        </div>
      </div>

      <footer className="flex justify-between items-center text-xs font-semibold tracking-wider text-slate-400 uppercase mt-4">
        <div>{window.location.hostname}</div>
        <div className="font-mono bg-slate-100 dark:bg-slate-900 px-2.5 py-1 rounded border dark:border-slate-800">
          INDEX NODE
        </div>
      </footer>
    </div>
  );
};

export const ViewProjector: React.FC<ProjectorProps> = ({ ast }) => {
  const { currentSlide, currentStep, updateState } = useSyncSlides(0);
  const frames = ast.frames || [];
  const activeFrame = frames[currentSlide];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        if (currentSlide < frames.length - 1) updateState(currentSlide + 1, 1);
      } else if (e.key === 'ArrowLeft') {
        if (currentSlide > 0) updateState(currentSlide - 1, 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide, frames.length]);

  if (!activeFrame) {
    return (
      <div className="h-screen w-screen bg-slate-950 flex justify-center items-center text-slate-500 font-mono">
        Aguardando transmissão de frames...
      </div>
    );
  }

  return (
    <div data-theme={ast.theme} className="w-screen h-screen overflow-hidden aspect-video">
      <DynamicFrameRenderer theme={ast.theme} frame={activeFrame} currentStep={currentStep}>
        {activeFrame.content.map((node, i) => (
          <SlideRenderer key={i} node={node} currentStep={currentStep} theme={ast.theme} />
        ))}
      </DynamicFrameRenderer>
    </div>
  );
};
