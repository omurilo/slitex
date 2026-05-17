import { createContext, useContext, useMemo } from 'react';
import type { Section, BibEntry, CitationRef } from '../types';

export interface PresentationContextValue {
  sections: Section[];
  presentationTitle: string;
  presentationSubtitle: string;
  presentationAuthor: string;
  presentationInstitute: string;
  presentationDate: string;
  bibliography: BibEntry[];
  citations: CitationRef[];
  macros: Record<string, string>;
  
  citationNumber: (key: string) => number;
  
  bibEntry: (key: string) => BibEntry | undefined;
}

export const PresentationContext = createContext<PresentationContextValue>({
  sections: [],
  presentationTitle: '',
  presentationSubtitle: '',
  presentationAuthor: '',
  presentationInstitute: '',
  presentationDate: '',
  bibliography: [],
  citations: [],
  macros: {},
  citationNumber: () => 0,
  bibEntry: () => undefined,
});

export function usePresentationContext() {
  return useContext(PresentationContext);
}

export function usePresentationContextValue(
  sections: Section[],
  presentationTitle: string,
  presentationSubtitle: string,
  presentationAuthor: string,
  presentationInstitute: string,
  presentationDate: string,
  bibliography: BibEntry[],
  citations: CitationRef[],
  macros: Record<string, string> = {},
): PresentationContextValue {
  const citMap = useMemo(() => {
    const m = new Map<string, number>();
    for (const c of citations) m.set(c.key, c.index);
    return m;
  }, [citations]);

  const bibMap = useMemo(() => {
    const m = new Map<string, BibEntry>();
    for (const b of bibliography) m.set(b.key, b);
    return m;
  }, [bibliography]);

  return useMemo(() => ({
    sections,
    presentationTitle,
    presentationSubtitle,
    presentationAuthor,
    presentationInstitute,
    presentationDate,
    bibliography,
    citations,
    macros,
    citationNumber: (key: string) => citMap.get(key) ?? 0,
    bibEntry: (key: string) => bibMap.get(key),
  }), [sections, presentationTitle, presentationSubtitle, presentationAuthor, presentationInstitute,
       presentationDate, bibliography, citations, macros, citMap, bibMap]);
}
