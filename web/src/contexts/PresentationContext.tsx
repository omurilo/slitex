import { createContext, useContext, useMemo } from 'react';
import type { Section, BibEntry, CitationRef } from '../types';

export interface PresentationContextValue {
  sections: Section[];
  presentationTitle: string;
  presentationAuthor: string;
  presentationInstitute: string;
  presentationDate: string;
  bibliography: BibEntry[];
  citations: CitationRef[];
  /** Returns the sequential citation number (1-based) for a given key, or 0 if unknown. */
  citationNumber: (key: string) => number;
  /** Returns the BibEntry for a given key, or undefined. */
  bibEntry: (key: string) => BibEntry | undefined;
}

export const PresentationContext = createContext<PresentationContextValue>({
  sections: [],
  presentationTitle: '',
  presentationAuthor: '',
  presentationInstitute: '',
  presentationDate: '',
  bibliography: [],
  citations: [],
  citationNumber: () => 0,
  bibEntry: () => undefined,
});

export function usePresentationContext() {
  return useContext(PresentationContext);
}

/** Build a PresentationContextValue from raw AST data. */
export function usePresentationContextValue(
  sections: Section[],
  presentationTitle: string,
  presentationAuthor: string,
  presentationInstitute: string,
  presentationDate: string,
  bibliography: BibEntry[],
  citations: CitationRef[],
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
    presentationAuthor,
    presentationInstitute,
    presentationDate,
    bibliography,
    citations,
    citationNumber: (key: string) => citMap.get(key) ?? 0,
    bibEntry: (key: string) => bibMap.get(key),
  }), [sections, presentationTitle, presentationAuthor, presentationInstitute,
       presentationDate, bibliography, citations, citMap, bibMap]);
}
