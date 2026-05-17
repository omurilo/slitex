---
title: Comandos LaTeX Suportados
order: 1
---

# Comandos LaTeX Suportados

Esta página lista todos os comandos LaTeX reconhecidos pelo parser do slitex.
Comandos não listados aqui são ignorados silenciosamente (sem erro de build).

## Preâmbulo

### Metadados da apresentação

| Comando | Descrição |
|---|---|
| `\title[curto]{longo}` | Título da apresentação |
| `\subtitle{...}` | Subtítulo |
| `\author[curto]{longo}` | Autor(es) |
| `\institute[curto]{longo}` | Instituição |
| `\date[curto]{...}` | Data (aceita `\today`) |

### Tema e visual

| Comando | Descrição |
|---|---|
| `\usetheme{nome}` | Seleciona o tema (case-insensitive) |
| `\usecolortheme{nome}` | Aceito, mas ignorado (temas têm cores fixas) |
| `\usefonttheme{nome}` | Aceito, mas ignorado |
| `\useinnertheme{nome}` | Aceito, mas ignorado |
| `\usepackage{...}` | Aceito; pacotes relevantes são processados |

### Cores

```latex
% Define uma cor nomeada (formato HTML)
\definecolor{MinhaCorVermelha}{HTML}{FF5555}

% Define uma cor nomeada (formato RGB normalizado 0-1)
\definecolor{MinhaCorVerde}{rgb}{0.31, 0.98, 0.48}

% Alias de cor
\colorlet{Destaque}{MinhaCorVermelha}
```

As cores definidas podem ser usadas em `\textcolor{}{}` dentro dos slides.

### Listagens de código

```latex
% Define um estilo de listagem
\lstdefinestyle{MeuEstilo}{
    language=Python,
    basicstyle=\ttfamily\small,
    keywordstyle=\color{MinhaCorAzul},
    ...
}

% Cria um novo ambiente de código personalizado (tcolorbox)
\newtcblisting{MinhaListagem}[1]{
    listing only,
    listing options={style=MeuEstilo},
    colback=FundoEscuro,
    colframe=Borda,
    title=#1,
}

% Ambiente alternativo (listings puro)
\lstnewenvironment{MeuCodigo}[1][]{
    \lstset{style=MeuEstilo,#1}
}{}
```

---

## Corpo do documento (`\begin{document}`)

### Estrutura

| Comando / Ambiente | Descrição |
|---|---|
| `\section{nome}` | Registra uma seção na AST |
| `\subsection{nome}` | Registra uma subseção |
| `\begin{frame}...\end{frame}` | Define um slide |
| `\begin{frame}[plain]` | Slide sem header/footer |
| `\begin{frame}[fragile]` | Aceito (necessário para lstlisting) |
| `\titlepage` | Slide de título (usa metadados do preâmbulo) |
| `\tableofcontents` | Sumário das seções |

### Dentro dos frames

#### Título do slide

```latex
\begin{frame}{Título Direto}
\begin{frame}
  \frametitle{Título via Comando}
  \framesubtitle{Subtítulo}
```

#### Listas

```latex
\begin{itemize}
  \item Texto
  \item<2-> Aparece no passo 2 (overlay)
\end{itemize}

\begin{enumerate}
  \item Primeiro
\end{enumerate}
```

#### Blocos

```latex
\begin{block}{Título}         % azul
\begin{exampleblock}{Título}  % verde
\begin{alertblock}{Título}    % vermelho
```

#### Colunas

```latex
\begin{columns}
  \begin{column}{0.5\textwidth}
    Coluna esquerda
  \end{column}
  \begin{column}{0.5\textwidth}
    Coluna direita
  \end{column}
\end{columns}
```

#### Código (lstlisting embutido)

```latex
\begin{lstlisting}[language=Python, caption=Exemplo]
def hello():
    print("Olá mundo!")
\end{lstlisting}
```

#### Código (ambiente personalizado)

```latex
% Usando um ambiente criado com \newtcblisting ou \lstnewenvironment
\begin{MinhaListagem}{Título da Caixa}
function exemplo() {
  return 42;
}
\end{MinhaListagem}
```

---

## Formatação inline

| Comando | Resultado |
|---|---|
| `\textbf{texto}` | **negrito** |
| `\textit{texto}` | *itálico* |
| `\texttt{texto}` | `código monospace` |
| `\emph{texto}` | *itálico* (ênfase) |
| `\alert{texto}` | texto em cor de alerta (accent do tema) |
| `\textcolor{nome}{texto}` | texto com cor nomeada (de `\definecolor`) |
| `\textcolor[HTML]{FF0000}{texto}` | texto com cor hexadecimal inline |
| `$expressão$` | fórmula matemática inline (KaTeX) |
| `$$expressão$$` | fórmula matemática em bloco |
| `\href{url}{texto}` | link clicável |
| `\url{url}` | URL clicável |
| `\footcite{chave}` | citação no rodapé |
| `\cite{chave}` | citação inline |

---

## Referências bibliográficas

```latex
% Preâmbulo
\usepackage[style=authortitle-icomp, backend=biber]{biblatex}
\addbibresource{presentation.bib}

% No frame
\begin{frame}[allowframebreaks]
  \frametitle{Referências}
  \printbibliography
\end{frame}
```

O slitex faz o parser básico do arquivo `.bib` referenciado para resolver
`\footcite{}` e `\cite{}`.

---

## Imagens

```latex
\includegraphics[width=0.5\textwidth]{nome-do-arquivo}
```

O slitex procura a imagem nos caminhos declarados com `\graphicspath{}` e serve
os arquivos encontrados via `/api/asset`.

---

## Comandos ignorados (sem efeito visual)

Os comandos abaixo são aceitos pelo parser sem causar erro, mas não produzem
saída visual:

- `\setbeamertemplate{...}`
- `\setbeamercolor{...}`
- `\setbeamerfont{...}`
- `\usecolortheme{...}`
- `\usefonttheme{...}`
- `\useinnertheme{...}`
- `\usepackage{...}` (exceto os processados acima)
- `\graphicspath{...}`
- `\hypersetup{...}`
