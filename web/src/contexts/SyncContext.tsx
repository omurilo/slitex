import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

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
      } catch {}
    };

    return () => source.close();
  }, []);

  const updateState = useCallback((nextSlide: number, nextStep: number) => {
    setState({ currentSlide: nextSlide, currentStep: nextStep });
    fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slide: nextSlide, step: nextStep }),
    }).catch(() => {});
  }, []);

  return (
    <SyncContext.Provider value={{ ...state, updateState }}>
      {children}
    </SyncContext.Provider>
  );
}

export function useSyncContext() {
  return useContext(SyncContext);
}
