---
title: Comandos CLI
order: 3
---

# Comandos CLI

O slitex possui três subcomandos. Se nenhum subcomando for fornecido, `serve` é usado como padrão.

```
slitex <comando> [opções] <arquivo.tex>
```

---

## serve

Inicia o servidor de desenvolvimento com live reload e sincronização entre janelas.

```bash
slitex serve [opções] <arquivo.tex>
# atalho (sem subcomando):
slitex <arquivo.tex>
```

### Opções

| Flag | Padrão | Descrição |
|---|---|---|
| `-port` | `3000` | Porta HTTP do servidor |

### Exemplos

```bash
# Porta padrão
slitex serve presentation.tex

# Porta customizada
slitex serve -port 8080 presentation.tex

# Forma abreviada (backwards-compatible)
slitex presentation.tex
```

O navegador abre automaticamente em `http://localhost:<porta>`.

---

## build

Gera um site estático autocontido — HTML, CSS, JS e assets da apresentação —
prontos para hospedar em qualquer servidor ou CDN, sem dependência do binário
slitex em tempo de execução.

```bash
slitex build [opções] <arquivo.tex>
```

### Opções

| Flag | Padrão | Descrição |
|---|---|---|
| `-o` | `dist/` (ao lado do `.tex`) | Diretório de saída |

### O que é gerado

```
<output>/
  index.html          ← app completo com AST embutida
  assets/             ← JS e CSS do frontend
  files/              ← imagens referenciadas nos slides
```

A AST da apresentação é serializada em JSON e injetada diretamente no `index.html`,
de modo que o site funciona sem nenhuma requisição ao servidor Go.

### Exemplos

```bash
# Saída padrão (dist/ ao lado do .tex)
slitex build presentation.tex

# Saída customizada
slitex build -o ./public presentation.tex
```

---

## print

Gera um arquivo PDF da apresentação usando um navegador headless (Chrome/Chromium).
Não é necessário abrir o servidor manualmente — o `print` sobe e derruba o servidor
internamente.

```bash
slitex print [opções] <arquivo.tex>
```

### Opções

| Flag | Padrão | Descrição |
|---|---|---|
| `-o` | `<nome>.pdf` (ao lado do `.tex`) | Arquivo PDF de saída |

### Pré-requisitos

Chrome ou Chromium deve estar instalado e acessível no sistema. O slitex usa
[chromedp](https://github.com/chromedp/chromedp) para controlar o navegador
headless — nenhuma configuração adicional é necessária.

### Exemplos

```bash
# Saída padrão (mesmo nome do .tex)
slitex print presentation.tex

# Arquivo de saída customizado
slitex print -o slides.pdf presentation.tex
```

### Diferenças em relação ao Print do navegador

| | `slitex print` | View `/print` no navegador |
|---|---|---|
| Requer servidor rodando | Não | Sim |
| Requer interação manual | Não | Sim |
| Adequado para CI/automação | Sim | Não |
| Tamanho de página | 20 × 11.25 pol. (16:9) | Definido pelo navegador |
