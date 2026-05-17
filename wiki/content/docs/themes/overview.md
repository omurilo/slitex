---
title: Sistema de Temas
order: 1
---

# Sistema de Temas

O slitex implementa o sistema de temas do LaTeX Beamer como componentes React.
Basta usar `\usetheme{NomeDotema}` no preâmbulo do seu `.tex` e o frontend
aplica automaticamente o tema correspondente.

```latex
\usetheme{Warsaw}
```

O nome é **case-insensitive** — `Warsaw`, `warsaw` e `WARSAW` funcionam da mesma forma.

## Como funciona

Cada tema é um componente `ThemeFrameComponent` que recebe:

- O objeto `frame` (título, subtítulo, tipo)
- Metadados da apresentação (autor, instituição, data)
- O `slideIndex` e total de slides
- Os `children` renderizados (conteúdo do slide)

O componente é responsável pelo layout completo: header, área de conteúdo,
footer, barra de progresso e navegação.

## Fallback

Se `\usetheme{}` não for declarado, ou se o tema informado não existir no
registro, o tema `default` é usado automaticamente.

## Tema `plain`

Qualquer slide com `\begin{frame}[plain]` ignora o header/footer do tema e
renderiza apenas o conteúdo centralizado, independentemente do tema ativo.

## Próximos passos

- [Temas Embutidos](/docs/themes/builtin) — todos os 12 temas disponíveis
