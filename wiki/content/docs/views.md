---
title: Views
order: 4
---

# Views

O slitex expõe quatro views acessíveis por URL. Cada uma atende um cenário
diferente de apresentação.

## Visão geral

| View | URL | Descrição |
|---|---|---|
| **Presenter** | `/` | Modo principal — exibe o slide atual com controles |
| **Projector** | `/projector` | Para a tela do projetor/TV — sincronizado com o Presenter |
| **Overview** | `/overview` | Grade de miniaturas de todos os slides |
| **Print / PDF** | `/print` | Todos os slides em sequência para exportar como PDF |

## Presenter (`/`)

A view principal. Exibe o slide atual em tela cheia com:

- Navegação com **setas do teclado** (← →) ou clique
- Suporte a **overlays** (passos com `\item<N->`)
- Teclas de atalho:

| Tecla | Ação |
|---|---|
| `→` / `Space` | Próximo slide / passo |
| `←` | Slide anterior |
| `F` | Tela cheia |

## Projector (`/projector`)

Abre a view do projetor sincronizada com o Presenter via **BroadcastChannel**.
Coloque esta URL na tela secundária (HDMI) — o slide avança automaticamente
conforme você navega no Presenter.

```
# Fluxo típico
1. Abra /          no seu notebook
2. Abra /projector na tela do projetor (ou em outra aba/dispositivo na mesma rede)
3. Navegue normalmente no Presenter
```

## Overview (`/overview`)

Grade de miniaturas clicáveis de todos os slides. Ideal para:

- Visão rápida da estrutura da apresentação
- Pular para um slide específico

Clique em qualquer miniatura para ir direto àquele slide no Presenter.

## Print / PDF (`/print`)

Lista todos os slides em sequência, renderizados com o tema completo. Para
exportar como PDF:

1. Acesse `/print`
2. Clique em **Imprimir / Exportar PDF**
3. No diálogo do navegador, escolha **Salvar como PDF**
4. Ative a opção **Imprimir fundos** (Print backgrounds) para preservar cores

> **Dica:** Use o Chrome ou Edge para melhor fidelidade de cores no PDF.
> O Safari também funciona bem. O Firefox pode precisar de ajustes nas
> configurações de impressão.
