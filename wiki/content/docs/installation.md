---
title: Instalação
order: 2
---

# Instalação

## Opção 1: go install (recomendado)

Se você já tem o Go 1.23+ instalado, esta é a forma mais rápida:

```bash
go install github.com/omurilo/slitex@latest
```

O binário será colocado em `$(go env GOPATH)/bin`. Certifique-se de que esse caminho está no seu `$PATH`.

## Opção 2: Binário pré-compilado

Baixe o binário para a sua plataforma na [página de Releases](https://github.com/omurilo/slitex/releases/latest) e mova-o para um diretório no `$PATH`.

## Opção 3: Build a partir do código-fonte

### Pré-requisitos

| Ferramenta | Versão mínima |
|---|---|
| Go | 1.23+ |
| Node.js | 20+ |
| npm | 9+ |

### 1. Clone o repositório

```bash
git clone https://github.com/omurilo/slitex.git
cd slitex
```

### 2. Build do frontend

O frontend (React + Vite) precisa ser compilado antes do servidor Go, pois os
arquivos estáticos são embutidos via `//go:embed` no binário.

```bash
cd web
npm install
npm run build
cd ..
```

O comando gera os assets em `internal/ui/dist/`.

### 3. Build do servidor Go

```bash
go build -o slitex .
```

Ou execute diretamente sem gerar binário:

```bash
go run . serve ./minha-apresentacao.tex
```

## 4. Rodando

```bash
./slitex /caminho/para/sua/apresentacao.tex
```

O servidor sobe em `http://localhost:3000` por padrão e abre o navegador automaticamente.

## Flags disponíveis

| Flag | Padrão | Descrição |
|---|---|---|
| `-port` | `3000` | Porta do servidor HTTP |

## Desenvolvimento

Para trabalhar no frontend com hot-reload:

```bash
# Terminal 1 — servidor Go
go run . serve ./test_presentation/test2.tex

# Terminal 2 — dev server do Vite
cd web
npm run dev
```

O Vite proxeia as chamadas `/api/*` para o servidor Go (configurado em
`web/vite.config.ts`).
