import { useCallback, useEffect, useRef, useState } from 'react';

interface SlideState {
  currentSlide: number;
  currentStep: number;
}

export function useSyncSlides(initiaslitex = 0) {
  const [state, setState] = useState<SlideState>({
    currentSlide: initiaslitex,
    currentStep: 1,
  });
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    const source = new EventSource('/api/live');

    source.onmessage = (event) => {
      const raw = event.data as string;
      if (raw === 'reload') {
        window.location.reload();
        return;
      }
      try {
        const msg = JSON.parse(raw) as { type: string; slide: number; step: number };
        if (msg.type === 'sync') {
          setState({ currentSlide: msg.slide, currentStep: msg.step });
        }
      } catch {
        // ignore malformed messages
      }
    };

    return () => source.close();
  }, []);

  const updateState = useCallback((nextSlide: number, nextStep: number) => {
    setState({ currentSlide: nextSlide, currentStep: nextStep });
    fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slide: nextSlide, step: nextStep }),
    }).catch(() => {/* best-effort */});
  }, []);

  return {
    currentSlide: state.currentSlide,
    currentStep: state.currentStep,
    updateState,
  };
}
