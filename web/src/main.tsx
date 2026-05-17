import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { type PresentationAST } from './types';
import { ViewLanding } from './views/ViewLanding';
import { ViewPresenter } from './views/ViewPresenter';
import { ViewProjector } from './views/ViewProjector';
import { ViewOverview } from './views/ViewOverview';
import { ViewPrint } from './views/ViewPrint';
import { SyncProvider } from './contexts/SyncContext';
import './theme.css';

const nativeThemes = ['default', 'metropolis', 'madrid'];

function useExternalTheme(themeName: string) {
  useEffect(() => {
    if (!themeName || nativeThemes.includes(themeName)) return;

    const themePkgName = `slitex-theme-${themeName}`;

    let link = document.getElementById('external-theme-style') as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.id = 'external-theme-style';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    link.href = `/themes/external/${themePkgName}/dist/style.css`;

    let script = document.getElementById('external-theme-script') as HTMLScriptElement;
    if (!script) {
      script = document.createElement('script');
      script.id = 'external-theme-script';
      script.type = 'text/javascript';
      document.body.appendChild(script);
    }
    script.src = `/themes/external/${themePkgName}/dist/index.js`;
    script.onload = () => {
      console.log(`Tema externo [${themeName}] carregado.`);
    };
  }, [themeName]);
}

const KNOWN_CDN_PACKAGES: Record<string, string> = {
  'fontawesome':       'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
  'fontawesome5':      'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
  'fontawesome-free':  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
};

const KATEX_EXTENSIONS: Record<string, () => Promise<unknown>> = {
  'mhchem':    () => import('katex/contrib/mhchem' as string),
  'copy-tex':  () => import('katex/contrib/copy-tex' as string),
};

interface FontPackage { googleFontsUrl?: string; fontFamily: string }
const FONT_PACKAGES: Record<string, FontPackage> = {
  'palatino':      { fontFamily: "'Palatino Linotype', 'Book Antiqua', Palatino, serif" },
  'mathpazo':      { fontFamily: "'Palatino Linotype', 'Book Antiqua', Palatino, serif" },
  'newpxtext':     { fontFamily: "'Palatino Linotype', 'Book Antiqua', Palatino, serif" },
  'times':         { fontFamily: "'Times New Roman', Times, serif" },
  'mathptmx':      { fontFamily: "'Times New Roman', Times, serif" },
  'newtxtext':     { fontFamily: "'Times New Roman', Times, serif" },
  'helvet':        { fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" },
  'lmodern':       { fontFamily: "'Latin Modern Roman', Georgia, serif" },
  'courier':       { fontFamily: "'Courier New', Courier, monospace" },
  'opensans':      { googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300;0,400;0,600;0,700;1,400&display=swap', fontFamily: "'Open Sans', sans-serif" },
  'sourcesanspro': { googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@300;400;600;700&display=swap', fontFamily: "'Source Sans 3', 'Source Sans Pro', sans-serif" },
  'roboto':        { googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;700&display=swap', fontFamily: "'Roboto', sans-serif" },
  'firasans':      { googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Fira+Sans:wght@300;400;600;700&display=swap', fontFamily: "'Fira Sans', sans-serif" },
  'lato':          { googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&display=swap', fontFamily: "'Lato', sans-serif" },
  'montserrat':    { googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;600;700&display=swap', fontFamily: "'Montserrat', sans-serif" },
  'nunito':        { googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;600;700&display=swap', fontFamily: "'Nunito', sans-serif" },
};

function usePackages(packages: string[]) {
  useEffect(() => {
    if (!packages.length) return;

    let resolvedFont: FontPackage | null = null;

    for (const pkg of packages) {
      const key = pkg.toLowerCase();

      const cdnUrl = KNOWN_CDN_PACKAGES[key];
      if (cdnUrl) {
        const id = `pkg-css-${key}`;
        if (!document.getElementById(id)) {
          const link = document.createElement('link');
          link.id = id;
          link.rel = 'stylesheet';
          link.href = cdnUrl;
          document.head.appendChild(link);
        }
      }

      const ext = KATEX_EXTENSIONS[key];
      if (ext) ext();

      const font = FONT_PACKAGES[key];
      if (font) resolvedFont = font;
    }

    if (resolvedFont) {
      if (resolvedFont.googleFontsUrl) {
        const id = `pkg-gf-${resolvedFont.fontFamily.split(',')[0].replace(/[^a-z]/gi, '')}`;
        if (!document.getElementById(id)) {
          const link = document.createElement('link');
          link.id = id;
          link.rel = 'stylesheet';
          link.href = resolvedFont.googleFontsUrl;
          document.head.appendChild(link);
        }
      }
      const styleId = 'slitex-font-override';
      let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;
      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = styleId;
        document.head.appendChild(styleEl);
      }
      styleEl.textContent = `.slide-canvas { font-family: ${resolvedFont.fontFamily} !important; }`;
    }
  }, [packages]);
}

function getInitiaslitex(): number {
  const params = new URLSearchParams(window.location.search);
  const slide = params.get('slide');
  return slide ? Math.max(0, parseInt(slide, 10) - 1) : 0;
}

// eslint-disable-next-line react-refresh/only-export-components
function App() {
  const [ast, setAst] = useState<PresentationAST | null>(null);
  const [error, setError] = useState<string | null>(null);
  const path = window.location.pathname;
  const initiaslitex = getInitiaslitex();

  useExternalTheme(ast?.theme ?? '');
  usePackages(ast?.packages ?? []);

  useEffect(() => {
    const fetchAST = async () => {
      try {
        const res = await fetch('/api/ast');
        if (!res.ok) {
          const text = await res.text();
          setError(text);
          return;
        }
        const data: PresentationAST & { error?: string } = await res.json();
        if (data.error) {
          setError(data.error);
          return;
        }
        setError(null);
        setAst(data);
      } catch (err) {
        setError(String(err));
      }
    };

    fetchAST();
  }, []);

  if (error) {
    return (
      <div className="h-screen w-screen bg-slate-950 flex flex-col justify-center items-center p-8 gap-6">
        <div className="text-red-400 font-mono text-sm bg-red-950/40 border border-red-800 rounded-xl p-6 max-w-2xl w-full">
          <p className="font-bold text-red-300 mb-3 text-base">Erro ao compilar apresentação</p>
          <pre className="whitespace-pre-wrap break-all text-xs leading-relaxed">{error}</pre>
        </div>
        <p className="text-slate-600 text-xs font-mono animate-pulse">Monitorando arquivo para mudanças...</p>
      </div>
    );
  }

  if (!ast) {
    return (
      <div className="h-screen w-screen bg-slate-950 flex justify-center items-center">
        <p className="font-mono text-sm tracking-widest text-slate-500 animate-pulse">
          Aguardando compilação...
        </p>
      </div>
    );
  }

  if (path === '/presenter') return <SyncProvider initialSlide={initiaslitex}><ViewPresenter ast={ast} /></SyncProvider>;
  if (path === '/projector') return <SyncProvider initialSlide={initiaslitex}><ViewProjector ast={ast} /></SyncProvider>;
  if (path === '/overview') return <SyncProvider><ViewOverview ast={ast} /></SyncProvider>;
  if (path === '/print') return <ViewPrint ast={ast} />;
  return <SyncProvider initialSlide={initiaslitex}><ViewLanding ast={ast} /></SyncProvider>;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
