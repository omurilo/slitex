---
title: Instalação
order: 2
---

# Instalação

## Pré-requisitos

| Ferramenta | Versão mínima |
|---|---|
| Go | 1.21+ |
| Node.js | 18+ |
| npm | 9+ |

## 1. Clone o repositório

```bash
git clone https://github.com/omurilo/slitex.git
cd slitex
```

## 2. Build do frontend

O frontend (React + Vite) precisa ser compilado antes do servidor Go, pois os
arquivos estáticos são embutidos via `//go:embed` no binário.

```bash
cd web
npm install
npm run build
cd ..
```

O comando gera os assets em `internal/ui/dist/`.

## 3. Build do servidor Go

```bash
go build -o slitex ./cmd/slitex
```

Ou execute diretamente sem gerar binário:

```bash
go run ./cmd/slitex ./minha-apresentacao.tex
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
go run ./cmd/slitex ./test_presentation/test2.tex

# Terminal 2 — dev server do Vite
cd web
npm run dev
```

O Vite proxeia as chamadas `/api/*` para o servidor Go (configurado em
`web/vite.config.ts`).
