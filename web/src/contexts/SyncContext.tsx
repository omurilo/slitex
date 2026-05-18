import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

declare global {
  interface Window {
    __SLITEX_STATIC__?: boolean;
  }
}

interface SyncState {
  currentSlide: number;
  currentStep: number;
}

interface SyncContextValue extends SyncState {
  updateState: (slide: number, step: number) => void;
}

const SyncContext = createContext<SyncContextValue>({
  currentSlide: 0,
  currentStep: 1,
  updateState: () => {},
});

export function SyncProvider({ children, initialSlide = 0 }: { children: ReactNode; initialSlide?: number }) {
  const [state, setState] = useState<SyncState>({ currentSlide: initialSlide, currentStep: 1 });

  useEffect(() => {
    if (window.__SLITEX_STATIC__) return;

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
      } catch { /* ignore */ }
    };

    return () => source.close();
  }, []);

  const updateState = useCallback((nextSlide: number, nextStep: number) => {
    setState({ currentSlide: nextSlide, currentStep: nextStep });
    if (!window.__SLITEX_STATIC__) {
      fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slide: nextSlide, step: nextStep }),
      }).catch(() => {});
    }
  }, []);

  return (
    <SyncContext.Provider value={{ ...state, updateState }}>
      {children}
    </SyncContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSyncContext() {
  return useContext(SyncContext);
}
