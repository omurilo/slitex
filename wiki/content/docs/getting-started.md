---
title: Introdução
order: 1
---

# O que é o slitex?

**slitex** é uma ferramenta de apresentação que renderiza arquivos `.tex` no
estilo do [LaTeX Beamer](https://ctan.org/pkg/beamer) diretamente no navegador,
em tempo real e com suporte a múltiplas views — presenter, projetor, visão geral
e exportação PDF.

O backend é escrito em **Go** e serve a AST do arquivo `.tex` como JSON via
`/api/ast`. O frontend é uma SPA em **React + TypeScript + Vite** que consome
essa AST e renderiza os slides com fidelidade visual ao Beamer.

## Por que slitex?

- Escreva suas apresentações em LaTeX puro — sem aprender novo formato
- Apresente no navegador com sincronização entre abas (presenter ↔ projetor)
- Exporte para PDF com um clique, preservando cores e temas
- 12 temas Beamer embutidos, prontos para uso com `\usetheme{}`

## Conceitos-chave

| Conceito | Descrição |
|---|---|
| **AST** | Representação estruturada do `.tex` gerada pelo parser Go |
| **Frame** | Cada `\begin{frame}...\end{frame}` vira um slide |
| **Theme** | Componente React que define o visual do slide |
| **View** | Página do frontend (presenter, projector, overview, print) |

## Próximos passos

- [Instalação](/docs/installation) — compile e rode o slitex
- [Comandos CLI](/docs/cli) — serve, build e print
- [Escrevendo apresentações](/docs/writing-presentations) — sintaxe LaTeX suportada
- [Views](/docs/views) — como usar cada modo de apresentação
- [Temas](/docs/themes/overview) — escolha e personalize temas
