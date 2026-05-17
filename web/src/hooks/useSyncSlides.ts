import { useSyncContext } from '../contexts/SyncContext';

export function useSyncSlides() {
  return useSyncContext();
}
