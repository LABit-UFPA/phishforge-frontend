# PhishForge — frontend

Interface do PhishForge (LABit/UFPA): geração e curadoria de exemplos de phishing.

## Configuração local

A API (`phishforge-api`) exige `X-API-Key` em toda rota `/api/v1` e não habilita CORS por padrão.
Para desenvolver contra uma API real:

1. Copie `.env.example` para `.env` e preencha `VITE_API_BASE_URL` e `VITE_API_KEY` (o `API_KEY` do `.env` da API).
2. No `.env` **da API**, defina `CORS_ALLOWED_ORIGINS=http://localhost:5173` (a origem do Vite). Sem isso o navegador bloqueia a resposta mesmo com a chave certa.
3. `npm install && npm run dev`.

> `VITE_API_KEY` vai para o bundle JavaScript e é **pública**: só use em desenvolvimento local.
> Em produção não há chave no bundle: o nginx faz proxy same-origin (ver "Produção" abaixo).

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


---

## Produção (Docker + nginx)

O container serve o build estático **e** faz proxy same-origin para a API. O navegador só fala com a própria
origem: sem CORS e sem chave de API no bundle.

| Rota no nginx | Destino |
|---|---|
| `/api/v1/expert/*` | proxy para a API (o `Authorization: Bearer` do especialista passa direto) |
| `/api/v1/researcher/*` | proxy para a API (o `X-API-Key` **digitado pelo pesquisador no console** passa direto) |
| qualquer outra `/api/v1/*` | `404` por padrão (geração, curadoria e avaliação gastam crédito da OpenAI e/ou expõem rótulos). Com `CURATION_ENABLED=1`: proxy com a chave injetada (ver abaixo) |
| resto | SPA (`try_files … /index.html`) |

O nginx **não injeta** a `RESEARCHER_API_KEY`: se injetasse, o console e o export (com PII) ficariam abertos a
qualquer um que alcançasse o frontend. A chave continua sendo um segredo que o pesquisador digita.

Consequência: por padrão a aba de curadoria (`/`, gerador e exemplos) não funciona por trás do proxy, de propósito.

### Curadoria local (`CURATION_ENABLED=1`)

Para testar a plataforma inteira num único endereço (ambiente **local ou interno**), suba com
`CURATION_ENABLED=1` e `CURATION_API_KEY=<API_KEY da API>`. O nginx passa a repassar `/api/v1/*` injetando a chave
servidor-a-servidor: ela fica no container, **não vai para o bundle**. Em contrapartida, quem alcançar a porta
passa a poder gerar (gasta crédito OpenAI) e apagar itens sem autenticação. Por isso o compose publica essa porta só
em `127.0.0.1`; nunca ligue isso numa origem pública.

### Variáveis

| Variável | Quando | Significado |
|---|---|---|
| `VITE_API_BASE_URL` | build (`--build-arg`) | Base da API. **Vazio (padrão do Dockerfile) = same-origin**; em dev, `http://localhost:8000`. |
| `VITE_APP_MODE` | build (`--build-arg`) | `full` (padrão): `/`, `/avaliacao/*` e `/pesquisador`. `expert`: só `/avaliacao/*` (as demais dão "Página não encontrada"). Valor desconhecido cai em `expert`. **Conveniência de implantação, não segurança**: o cegamento e a autenticação são do servidor. |
| `VITE_API_KEY` | build, só dev | Chave servidor-a-servidor. **Vai para o bundle (pública).** Nunca use em imagem de produção (o `.dockerignore` já exclui `.env*`). |
| `CURATION_ENABLED` / `CURATION_API_KEY` | runtime (`-e`) | `0` (padrão) ou `1`, e a chave servidor-a-servidor injetada pelo nginx quando `1`. Ver "Curadoria local". |
| `API_UPSTREAM` | runtime (`-e`) | Endereço da API para o proxy (padrão `http://phishforge-api:8000`). O nginx resolve o host na subida: a API precisa estar alcançável. |

```bash
docker build --build-arg VITE_APP_MODE=expert -t phishforge-frontend .
docker run -p 3000:3000 -e API_UPSTREAM=http://phishforge-api:8000 phishforge-frontend
```
