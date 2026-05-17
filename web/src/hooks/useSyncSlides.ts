import { useSyncContext } from '../contexts/SyncContext';

export function useSyncSlides(_initialSlide = 0) {
  return useSyncContext();
}
