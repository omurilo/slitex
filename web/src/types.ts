export type InlineType = 'text' | 'bold' | 'italic' | 'math';

export interface InlineContent {
  type: InlineType;
  value: string;
  overlay?: string;
}

export type ContentType = 'richtext' | 'block' | 'list' | 'columns' | 'column' | 'image';

export interface ContentNode {
  type: ContentType;
  inline?: InlineContent[];
  title?: string;
  width?: string;
  path?: string;
  overlay?: string;
  children?: ContentNode[];
  ordered?: boolean;
}

export interface Frame {
  title: string;
  subtitle: string;
  content: ContentNode[];
}

export interface PresentationAST {
  title: string;
  author: string;
  date: string;
  theme: string; // Adicionado à tipagem do frontend
  frames: Frame[];
}
