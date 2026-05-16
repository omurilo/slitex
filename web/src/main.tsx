import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { type PresentationAST } from './types';
import { ViewLanding } from './views/ViewLanding';
import { ViewPresenter } from './views/ViewPresenter';
import { ViewProjector } from './views/ViewProjector';
import './theme.css';

function useExternalTheme(themeName: string) {
  const nativeThemes = ['default', 'metropolis', 'madrid'];

  useEffect(() => {
    if (nativeThemes.includes(themeName)) return;

    const themePkgName = `lslide-theme-${themeName}`;

    // Injeta o CSS do tema para estilos gerais
    const cssUrl = `http://localhost:3000/themes/external/${themePkgName}/dist/style.css`;
    let link = document.getElementById('external-theme-style') as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.id = 'external-theme-style';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    link.href = cssUrl;

    // INJEÇÃO DO JS: Injeta os componentes React e animações compiladas do tema
    const jsUrl = `http://localhost:3000/themes/external/${themePkgName}/dist/index.js`;
    let script = document.getElementById('external-theme-script') as HTMLScriptElement;
    if (!script) {
      script = document.createElement('script');
      script.id = 'external-theme-script';
      script.type = 'text/javascript';
      document.body.appendChild(script);
    }
    script.src = jsUrl;

    script.onload = () => {
      console.log(`Componentes estruturais e animações do tema [${themeName}] carregados.`);
    };
  }, [themeName]);
}

function App() {
  const [ast, setAst] = useState<PresentationAST | null>(null);
  const path = window.location.pathname;

  const fetchAST = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/ast');
      const data = await res.json();
      setAst(data);
    } catch (err) {
      console.error("Falha ao comunicar com o compilador Go:", err);
    }
  };

  useEffect(() => {
    fetchAST();

    if (ast) {
      useExternalTheme(ast.theme);
    }

    // Conecta com o endpoint SSE de Live Reload construído no Go
    const eventSource = new EventSource('http://localhost:3000/api/live');
    eventSource.onmessage = () => {
      fetchAST(); // Re-compila a árvore instantaneamente ao salvar o arquivo .tex
    };

    return () => eventSource.close();
  }, []);

  if (!ast) {
    return (
      <div className="h-screen w-screen bg-slate-950 flex justify-center items-center">
        <p className="font-mono text-sm tracking-widest text-slate-500 animate-pulse">Aguardando compilação do motor Go...</p>
      </div>
    );
  }

  // Roteador Atômico Nativo
  if (path === '/presenter') return <ViewPresenter ast={ast} />;
  if (path === '/projector') return <ViewProjector ast={ast} />;
  return <ViewLanding ast={ast} />;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
