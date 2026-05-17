import { ThemeDefaultFrame } from './ThemeDefault';
import { ThemeMetropolisFrame } from './ThemeMetropolis';
import { ThemeMadridFrame } from './ThemeMadrid';
import type { Frame } from '../types';
import type React from 'react';

export interface ThemeFrameProps {
  frame: Frame;
  currentStep: number;
  slideIndex: number;
  totaslitexs: number;
  presentationTitle: string;
  presentationSubtitle: string;
  presentationAuthor: string;
  presentationInstitute: string;
  presentationDate: string;
  children: React.ReactNode;
}

export type ThemeFrameComponent = React.FC<ThemeFrameProps>;

export const builtinThemes: Record<string, ThemeFrameComponent> = {
  default: ThemeDefaultFrame,
  metropolis: ThemeMetropolisFrame,
  madrid: ThemeMadridFrame,
};
