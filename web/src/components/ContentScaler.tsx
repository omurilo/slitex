import React, { useRef, useLayoutEffect, useCallback } from 'react';

interface ContentScalerProps {
  children: React.ReactNode;
  
  style?: React.CSSProperties;
  
  minScale?: number;
}

const PAD_KEYS = new Set([
  'padding', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
  'paddingBlock', 'paddingBlockStart', 'paddingBlockEnd',
  'paddingInline', 'paddingInlineStart', 'paddingInlineEnd',
]);

function splitPadding(style: React.CSSProperties): [React.CSSProperties, React.CSSProperties] {
  const pad: Record<string, unknown> = {};
  const rest: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(style)) {
    (PAD_KEYS.has(k) ? pad : rest)[k] = v;
  }
  return [pad as React.CSSProperties, rest as React.CSSProperties];
}

export const ContentScaler: React.FC<ContentScalerProps> = ({
  children,
  style,
  minScale = 0.38,
}) => {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  const [innerPadding, outerStyle] = splitPadding(style ?? {});

  const applyScale = useCallback(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;

    inner.style.transform = 'none';
    inner.style.width = '100%';
    void inner.offsetHeight;

    const naturalH = inner.scrollHeight;
    const naturalW = inner.scrollWidth;
    const availH = outer.clientHeight;
    const availW = outer.clientWidth;

    if (naturalH <= 0 || availH <= 0) return;

    const scaleH = naturalH > availH ? availH / naturalH : 1;
    const scaleW = naturalW > availW ? availW / naturalW : 1;
    const next = Math.max(minScale, Math.min(scaleH, scaleW));

    if (next < 1) {
      inner.style.transform = `scale(${next})`;
    }
  }, [minScale]);

  useLayoutEffect(() => {
    applyScale();
    const ro = new ResizeObserver(applyScale);
    if (outerRef.current) ro.observe(outerRef.current);
    return () => ro.disconnect();
  });

  return (
    <div ref={outerRef} style={{ ...outerStyle, overflow: 'hidden', minHeight: 0 }}>
      <div
        ref={innerRef}
        style={{
          ...innerPadding,
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          transformOrigin: 'top left',
        }}
      >
        {children}
      </div>
    </div>
  );
};
