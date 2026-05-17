import { ThemeDefaultFrame } from './ThemeDefault';
import { ThemeMetropolisFrame } from './ThemeMetropolis';
import { ThemeMadridFrame } from './ThemeMadrid';
import { ThemeWarsawFrame } from './ThemeWarsaw';
import { ThemeFrankfurtFrame } from './ThemeFrankfurt';
import { ThemeCopenhagenFrame } from './ThemeCopenhagen';
import { ThemeBerlinFrame } from './ThemeBerlin';
import { ThemeBoadillaFrame } from './ThemeBoadilla';
import { ThemeCambridgeUSFrame } from './ThemeCambridgeUS';
import { ThemeDarmstadtFrame } from './ThemeDarmstadt';
import { ThemeAnnArborFrame } from './ThemeAnnArbor';
import { ThemeBerkeleyFrame } from './ThemeBerkeley';
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
  default:     ThemeDefaultFrame,
  metropolis:  ThemeMetropolisFrame,
  madrid:      ThemeMadridFrame,
  warsaw:      ThemeWarsawFrame,
  frankfurt:   ThemeFrankfurtFrame,
  copenhagen:  ThemeCopenhagenFrame,
  berlin:      ThemeBerlinFrame,
  boadilla:    ThemeBoadillaFrame,
  cambridgeus: ThemeCambridgeUSFrame,
  darmstadt:   ThemeDarmstadtFrame,
  annarbor:    ThemeAnnArborFrame,
  berkeley:    ThemeBerkeleyFrame,
};
