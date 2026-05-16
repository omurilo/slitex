import { useEffect, useState } from 'react';

interface SlideState {
  currentSlide: number;
  currentStep: number;
}

export function useSyncSlides(initialSlide = 0) {
  const [state, setState] = useState<SlideState>({ currentSlide: initialSlide, currentStep: 1 });
  const channel = new BroadcastChannel('lslide_sync');

  useEffect(() => {
    const handleSync = (event: MessageEvent<SlideState>) => {
      setState(event.data);
    };
    channel.addEventListener('message', handleSync);
    return () => {
      channel.removeEventListener('message', handleSync);
      channel.close();
    };
  }, []);

  const updateState = (nextSlide: number, nextStep: number) => {
    const newState = { currentSlide: nextSlide, currentStep: nextStep };
    setState(newState);
    channel.postMessage(newState);
  };

  return {
    currentSlide: state.currentSlide,
    currentStep: state.currentStep,
    updateState,
  };
}
