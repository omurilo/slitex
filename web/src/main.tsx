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

function useExternalTheme(themeName: string) {
  const nativeThemes = ['default', 'metropolis', 'madrid'];

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

function getInitiaslitex(): number {
  const params = new URLSearchParams(window.location.search);
  const slide = params.get('slide');
  return slide ? Math.max(0, parseInt(slide, 10) - 1) : 0;
}

function App() {
  const [ast, setAst] = useState<PresentationAST | null>(null);
  const [error, setError] = useState<string | null>(null);
  const path = window.location.pathname;
  const initiaslitex = getInitiaslitex();

  useExternalTheme(ast?.theme ?? '');

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

  if (path === '/presenter') return <SyncProvider initialSlide={initiaslitex}><ViewPresenter ast={ast} initiaslitex={initiaslitex} /></SyncProvider>;
  if (path === '/projector') return <SyncProvider initialSlide={initiaslitex}><ViewProjector ast={ast} initiaslitex={initiaslitex} /></SyncProvider>;
  if (path === '/overview') return <SyncProvider><ViewOverview ast={ast} /></SyncProvider>;
  if (path === '/print') return <ViewPrint ast={ast} />;
  return <SyncProvider initialSlide={initiaslitex}><ViewLanding ast={ast} /></SyncProvider>;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
