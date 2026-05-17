import React, { useRef, useLayoutEffect, useCallback } from 'react';

interface ContentScalerProps {
  children: React.ReactNode;
  /** Styles applied to the outer (clipping) container. Padding props are
   * automatically moved to the inner (scaled) div so that outer.clientHeight
   * reflects the pure available flex space — without padding inflation —
   * making the scale = availSize / naturalSize formula exact. */
  style?: React.CSSProperties;
  /** Minimum scale factor — content won't shrink below this (default 0.38). */
  minScale?: number;
}

const PAD_KEYS = new Set([
  'padding', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
  'paddingBlock', 'paddingBlockStart', 'paddingBlockEnd',
  'paddingInline', 'paddingInlineStart', 'paddingInlineEnd',
]);

/** Splits a CSSProperties object into [paddingProps, restProps]. */
function splitPadding(style: React.CSSProperties): [React.CSSProperties, React.CSSProperties] {
  const pad: Record<string, unknown> = {};
  const rest: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(style)) {
    (PAD_KEYS.has(k) ? pad : rest)[k] = v;
  }
  return [pad as React.CSSProperties, rest as React.CSSProperties];
}

/**
 * Wraps slide content and auto-scales it down when it overflows.
 *
 * Transform is managed entirely via direct DOM mutation — not React state —
 * so the inner div is ALWAYS left in the correct scaled state after each
 * measurement. The previous state-based approach had a bug: when the computed
 * scale didn't change, React bailed out of re-rendering, leaving the DOM stuck
 * at the temporary `transform:none / width:100%` used for measurement.
 */
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

    // Reset to natural (unscaled) state before measuring.
    inner.style.transform = 'none';
    inner.style.width = '100%';
    void inner.offsetHeight; // force synchronous layout flush

    // scrollHeight/scrollWidth capture true content size including overflow.
    const naturalH = inner.scrollHeight;
    const naturalW = inner.scrollWidth;
    // outer has no padding (moved to inner), so clientHeight/Width == available space.
    const availH = outer.clientHeight;
    const availW = outer.clientWidth;

    if (naturalH <= 0 || availH <= 0) return;

    const scaleH = naturalH > availH ? availH / naturalH : 1;
    const scaleW = naturalW > availW ? availW / naturalW : 1;
    const next = Math.max(minScale, Math.min(scaleH, scaleW));

    // Apply directly to the DOM — no React state — so the inner div is never
    // left at the temporary 'none'/'100%' reset state used for measurement.
    // width stays at '100%' (set in the reset above) — never set width > 100%,
    // which would shift text wrapping points and push text against the right edge.
    if (next < 1) {
      inner.style.transform = `scale(${next})`;
    }
    // If next === 1 the 'none'/'100%' already set above is correct.
  }, [minScale]);

  // Run after every commit (no deps) so any children change triggers a
  // re-measurement. ResizeObserver catches external container size changes.
  useLayoutEffect(() => {
    applyScale();
    const ro = new ResizeObserver(applyScale);
    if (outerRef.current) ro.observe(outerRef.current);
    return () => ro.disconnect();
  });

  return (
    // outer has NO padding — its clientHeight/Width == the flex-available space.
    // minHeight: 0 overrides the default flex min-height: auto so the flex
    // algorithm can constrain the outer to the available space.
    <div ref={outerRef} style={{ ...outerStyle, overflow: 'hidden', minHeight: 0 }}>
      <div
        ref={innerRef}
        style={{
          // Padding lives here — included in scrollHeight measurement.
          ...innerPadding,
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          transformOrigin: 'top left',
          // width and transform are managed imperatively by applyScale()
        }}
      >
        {children}
      </div>
    </div>
  );
};
