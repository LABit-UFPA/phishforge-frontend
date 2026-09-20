# PhishForge — frontend

Interface do PhishForge (LABit/UFPA): geração e curadoria de exemplos de phishing.

## Configuração local

A API (`phishforge-api`) exige `X-API-Key` em toda rota `/api/v1` e não habilita CORS por padrão.
Para desenvolver contra uma API real:

1. Copie `.env.example` para `.env` e preencha `VITE_API_BASE_URL` e `VITE_API_KEY` (o `API_KEY` do `.env` da API).
2. No `.env` **da API**, defina `CORS_ALLOWED_ORIGINS=http://localhost:5173` (a origem do Vite). Sem isso o navegador bloqueia a resposta mesmo com a chave certa.
3. `npm install && npm run dev`.

> `VITE_API_KEY` vai para o bundle JavaScript e é **pública**: só use em desenvolvimento local.
> Em produção a chave é injetada por um proxy same-origin no servidor (issue "Caminho de produção").

---

## Estrutura

```
src/
  components/
    Generator/   aba "Gerador": controles, progresso do lote, resultados e detalhe
    Examples/    aba "Exemplos": estatísticas, filtros, lista paginada
    UI/          componentes genéricos (ErrorBanner, ConfirmDialog, Pagination, ErrorBoundary…)
  hooks/         useGenerator (geração única e lote assíncrono), useExamples, useDebouncedValue
  services/      http.ts (fetch + X-API-Key + ApiError) e apiService.ts (rotas da API)
  types/         contrato da API
```

## Scripts

- `npm run dev` — servidor de desenvolvimento (Vite).
- `npm run build` — checagem de tipos (`tsc -b`) e build de produção.
- `npm run lint` — ESLint.
