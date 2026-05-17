export type InlineType = 'text' | 'bold' | 'italic' | 'math' | 'alert' | 'colored' | 'citation' | 'url';

export interface InlineContent {
  type: InlineType;
  value: string;
  color?: string;
  overlay?: string;
  size?: string;
}

export type ContentType =
  | 'richtext'
  | 'block'
  | 'list'
  | 'columns'
  | 'column'
  | 'image'
  | 'verbatim'
  | 'code'
  | 'table'
  | 'tablerow'
  | 'toc'
  | 'spacer'
  | 'vfill'
  | 'quote'
  | 'bibliography';

export interface ContentNode {
  type: ContentType;
  inline?: InlineContent[];
  title?: string;
  width?: string;
  path?: string;
  lang?: string;
  overlay?: string;
  children?: ContentNode[];
  ordered?: boolean;
  centered?: boolean;
}

export interface Section {
  title: string;
  slideIndex: number;
}

export interface CitationRef {
  key: string;
  index: number;
}

export interface BibEntry {
  key: string;
  type: string;
  author?: string;
  title?: string;
  year?: string;
  journal?: string;
  booktitle?: string;
  publisher?: string;
  pages?: string;
  volume?: string;
  number?: string;
  url?: string;
  note?: string;
  howpublished?: string;
}

export interface Frame {
  title: string;
  subtitle: string;
  notes: string;
  maxSteps: number;
  section?: string;
  titlePage?: boolean;
  plain?: boolean;
  content: ContentNode[];
}

export interface PresentationAST {
  title: string;
  subtitle?: string;
  author: string;
  institute?: string;
  date?: string;
  theme: string;
  language?: string;
  packages?: string[];
  sections: Section[];
  frames: Frame[];
  bibResources?: string[];
  citations?: CitationRef[];
  bibliography?: BibEntry[];
}
