---
title: Escrevendo Apresentações
order: 3
---

# Escrevendo Apresentações

O slitex aceita arquivos `.tex` no formato **LaTeX Beamer padrão**. Você não
precisa mudar sua sintaxe — o parser é capaz de interpretar os comandos mais
comuns e convertê-los para a AST que o frontend renderiza.

## Estrutura básica

```latex
\documentclass[aspectratio=169]{beamer}

\usetheme{Warsaw}

\title{Minha Apresentação}
\subtitle{Um subtítulo opcional}
\author{Seu Nome}
\institute{Sua Instituição}
\date{\today}

\begin{document}

\begin{frame}
  \titlepage
\end{frame}

\section{Introdução}

\begin{frame}{Título do Slide}
  Conteúdo do slide aqui.
\end{frame}

\end{document}
```

## Metadados

Defina os metadados da apresentação no preâmbulo:

| Comando | Descrição |
|---|---|
| `\title{...}` | Título principal (suporta `[título curto]{título longo}`) |
| `\subtitle{...}` | Subtítulo |
| `\author{...}` | Autor(es) |
| `\institute{...}` | Instituição |
| `\date{...}` | Data (aceita `\today`) |

## Frames (slides)

Cada slide é um `\begin{frame}...\end{frame}`.

```latex
% Título no ambiente
\begin{frame}{Meu Título}
  Conteúdo...
\end{frame}

% Título com \frametitle
\begin{frame}
  \frametitle{Meu Título}
  Conteúdo...
\end{frame}

% Slide sem decoração (plain)
\begin{frame}[plain]
  {\Huge The End}
\end{frame}

% Slide de título
\begin{frame}
  \titlepage
\end{frame}
```

## Listas

```latex
% Lista não-ordenada
\begin{itemize}
  \item Primeiro item
  \item Segundo item
    \begin{itemize}
      \item Sub-item aninhado
    \end{itemize}
\end{itemize}

% Lista ordenada
\begin{enumerate}
  \item Passo um
  \item Passo dois
\end{enumerate}
```

## Blocos

```latex
% Bloco padrão (fundo azul)
\begin{block}{Título do Bloco}
  Conteúdo do bloco.
\end{block}

% Bloco de exemplo (fundo verde)
\begin{exampleblock}{Destaque}
  Texto de exemplo.
\end{exampleblock}

% Bloco de alerta (fundo vermelho)
\begin{alertblock}{Atenção}
  Aviso importante.
\end{alertblock}
```

## Seções

Use `\section{}` para organizar os slides. As seções são registradas na AST e
usadas por alguns temas para exibir progresso de navegação.

```latex
\section{Introdução}
\subsection{Contexto}
```

## Formatação inline

| Comando | Resultado |
|---|---|
| `\textbf{texto}` | **negrito** |
| `\textit{texto}` | *itálico* |
| `\texttt{texto}` | `código inline` |
| `\textcolor{cor}{texto}` | texto colorido |
| `\alert{texto}` | texto em destaque (vermelho/accent) |
| `$x^2 + y^2$` | fórmula matemática inline |

## Tabela de conteúdo

```latex
\begin{frame}{Outline}
  \tableofcontents
\end{frame}
```

## Overlays (passos)

```latex
\begin{frame}{Com Overlays}
  \begin{itemize}
    \item<1-> Visível do passo 1 em diante
    \item<2-> Aparece no passo 2
    \item<3-> Aparece no passo 3
  \end{itemize}
\end{frame}
```

Use as setas do teclado no modo **Presenter** para navegar entre os passos.
