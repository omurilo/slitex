import { createContext, useContext } from 'react';
import type { Section } from '../types';

export interface PresentationContextValue {
  sections: Section[];
  presentationTitle: string;
  presentationAuthor: string;
  presentationInstitute: string;
  presentationDate: string;
}

export const PresentationContext = createContext<PresentationContextValue>({
  sections: [],
  presentationTitle: '',
  presentationAuthor: '',
  presentationInstitute: '',
  presentationDate: '',
});

export function usePresentationContext() {
  return useContext(PresentationContext);
}
