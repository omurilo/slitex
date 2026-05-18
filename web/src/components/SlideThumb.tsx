import React, { useLayoutEffect, useRef, useState } from 'react';
import type { Frame, PresentationAST } from '../types';
import { builtinThemes } from '../themes';
import { PresentationContext, usePresentationContextValue } from '../contexts/PresentationContext';
import { SlideRenderer } from './SlideRenderer';

interface SlideThumbProps {
  frame: Frame;
  ast: PresentationAST;
  slideIndex: number;
}

const DESIGN_W = 1920;
const DESIGN_H = 1080;

export const SlideThumb: React.FC<SlideThumbProps> = ({ frame, ast, slideIndex }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const { width } = el.getBoundingClientRect();
      if (width > 0) setScale(width / DESIGN_W);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const BuiltinFrame = builtinThemes[ast.theme] ?? builtinThemes['default'];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ExternalTheme = (window as any).slitexThemes?.[ast.theme];
  const FrameComponent = ExternalTheme?.Frame ?? BuiltinFrame;

  const ctxValue = usePresentationContextValue(
    ast.sections ?? [],
    ast.title,
    ast.subtitle ?? '',
    ast.author,
    ast.institute ?? '',
    ast.date ?? '',
    ast.bibliography ?? [],
    ast.citations ?? [],
    ast.macros ?? {},
  );

  return (
    <PresentationContext.Provider value={ctxValue}>
      
      <div
        ref={containerRef}
        className="slide-thumb-outer"
        style={{ width: '100%', aspectRatio: '16/9', overflow: 'hidden', position: 'relative', background: '#000' }}
      >
        {scale > 0 && (
          <div
            className="slide-thumb-inner"
            style={{
              width: DESIGN_W,
              height: DESIGN_H,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              '--slide-scale': 1,
              position: 'absolute',
              top: 0,
              left: 0,
              pointerEvents: 'none',
              userSelect: 'none',
            } as React.CSSProperties}
          >
            <FrameComponent
              frame={frame}
              currentStep={1}
              slideIndex={slideIndex}
              totaslitexs={ast.frames?.length ?? 1}
              presentationTitle={ast.title}
              presentationSubtitle={ast.subtitle ?? ''}
              presentationAuthor={ast.author}
              presentationInstitute={ast.institute ?? ''}
              presentationDate={ast.date ?? ''}
            >
              {frame.content.map((node, i) => (
                <SlideRenderer key={i} node={node} currentStep={1} theme={ast.theme} />
              ))}
            </FrameComponent>
          </div>
        )}
      </div>
    </PresentationContext.Provider>
  );
};
