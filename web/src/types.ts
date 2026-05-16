export type InlineType = 'text' | 'bold' | 'italic' | 'math' | 'alert' | 'colored' | 'citation';

export interface InlineContent {
  type: InlineType;
  value: string;
  color?: string;
  overlay?: string;
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
  | 'quote';

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
}

export interface Section {
  title: string;
  slideIndex: number;
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
  author: string;
  institute?: string;
  date?: string;
  theme: string;
  sections: Section[];
  frames: Frame[];
}
