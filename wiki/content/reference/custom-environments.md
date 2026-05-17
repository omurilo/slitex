---
title: Ambientes de Código Personalizados
order: 2
---

# Ambientes de Código Personalizados

O slitex suporta a definição de ambientes de código personalizados no preâmbulo,
compatível com os pacotes **`tcolorbox`** e **`listings`** do LaTeX.

## `\newtcblisting`

Cria um ambiente de caixa de código estilizada com `tcolorbox`:

```latex
\newtcblisting{NomeDoAmbiente}[nargs]{
    listing only,
    listing options={style=MeuEstilo},
    colback=CorDeFundo,
    colframe=CorDaBorda,
    coltext=CorDoTexto,
    title=#1,
    ...
}
```

### Parâmetros reconhecidos

| Parâmetro tcolorbox | Efeito no slitex |
|---|---|
| `listing only` | Indica que é um bloco de código |
| `listing options={style=X}` | Resolve a linguagem pelo estilo `X` (via `\lstdefinestyle`) |
| `title=#1` | O primeiro argumento do ambiente vira o título do bloco |
| `colback=...` | Cor de fundo da caixa |
| `colframe=...` | Cor da borda |

### Exemplo completo

```latex
% Preâmbulo
\definecolor{DraculaBackground}{HTML}{282A36}
\definecolor{DraculaPurple}{HTML}{BD93F9}
\definecolor{DraculaForeground}{HTML}{F8F8F2}

\lstdefinestyle{DraculaText}{
    language=Pascal,
    basicstyle=\ttfamily\small\color{DraculaForeground},
    keywordstyle=\color{DraculaPink},
    ...
}

\newtcblisting{caixaCodigoDracula}[1]{
    listing only,
    listing options={style=DraculaText},
    colback=DraculaBackground,
    colframe=DraculaPurple,
    title=#1,
    enhanced,
}

% No frame
\begin{frame}[fragile]
  \begin{caixaCodigoDracula}{Meu Título}
procedure HelloWorld;
begin
  WriteLn('Hello, World!');
end;
  \end{caixaCodigoDracula}
\end{frame}
```

O ambiente `caixaCodigoDracula` será renderizado como um bloco de código com:
- Fundo `#282A36`
- Borda `#BD93F9`
- Sintaxe colorida para Pascal
- Título acima da caixa

---

## `\lstnewenvironment`

Alternativa mais simples para ambientes de listagem sem caixa decorativa:

```latex
\lstnewenvironment{MeuCodigo}[1][]{
    \lstset{style=MeuEstilo, #1}
}{}
```

### Uso no frame

```latex
\begin{frame}[fragile]
  \begin{MeuCodigo}
int main() {
    printf("Hello!\n");
    return 0;
}
  \end{MeuCodigo}
\end{frame}
```

---

## `\begin{lstlisting}` (embutido)

Sem precisar de definições no preâmbulo:

```latex
\begin{lstlisting}[language=Go, caption=Exemplo em Go]
package main

import "fmt"

func main() {
    fmt.Println("Hello, slitex!")
}
\end{lstlisting}
```

Parâmetros suportados no `[...]`:

| Parâmetro | Descrição |
|---|---|
| `language=X` | Linguagem para highlight |
| `caption=texto` | Título exibido acima do bloco |
| `style=X` | Estilo definido com `\lstdefinestyle` |

---

## Como o parser lida com conteúdo verbatim

Ambientes de código têm uma particularidade: o conteúdo **não é tokenizado**
como LaTeX — é lido como texto bruto até o marcador `\end{NomeDoAmbiente}`.

Isso permite incluir qualquer caractere especial LaTeX (`{`, `}`, `\`, `$`, etc.)
sem precisar de escape, exatamente como no LaTeX original.

> **Importante:** Frames que contêm ambientes de código verbatim **devem**
> ser declarados com `[fragile]`:
> ```latex
> \begin{frame}[fragile]
> ```
> Assim como no LaTeX real. O slitex não exige isso tecnicamente, mas é boa
> prática para compatibilidade.

---

## Resolução de linguagem

O slitex determina a linguagem de highlight seguindo esta ordem:

1. Parâmetro `language=X` direto no ambiente/lstlisting
2. `language=X` no estilo referenciado via `style=X` ou `listing options={style=X}`
3. Sem linguagem definida → highlight genérico

A lista de linguagens suportadas para highlight é a do
[highlight.js](https://highlightjs.org/), que inclui Go, C, C++, Python,
JavaScript, TypeScript, Rust, Java, Pascal, SQL, Bash, entre outros.
