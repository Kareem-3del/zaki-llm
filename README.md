# زكي · Zaki

**A sovereign, open-source Arabic LLM platform for government.**
Reasoning-first. Runs entirely on your own infrastructure. OpenAI-compatible API.

زكي نموذجٌ لغويٌّ عربيٌّ سياديٌّ مفتوح المصدر، موجَّهٌ للجهات الحكومية — مبنيٌّ للاستدلال ودعم القرار
وصياغة المراسلات الرسمية. يُنشَر بالكامل داخل بنية الجهة: **بياناتكم لا تغادر حدودكم**، وكل خطوة في
تحليله قابلة للمراجعة والتدقيق.

```
        ┌──────────────────────────────────────────────────────────────┐
        │  Browser (RTL, Arabic)        OpenAI-compatible clients/SDKs   │
        │  /  /models  /playground       (LangChain, openai-python, …)   │
        └───────────────┬───────────────────────────┬──────────────────┘
                        │ session cookie            │ Bearer API key
        ┌───────────────▼───────────────────────────▼──────────────────┐
        │                     Next.js (driving adapters)                 │
        │   app/api/chat   app/v1/chat/completions   app/api/auth …      │
        └───────────────────────────┬──────────────────────────────────┘
                                     │  (ports)
        ┌────────────────────────────▼─────────────────────────────────┐
        │                     src/core  (hexagonal)                      │
        │  chat ▸ policy/prompts  •  api ▸ OpenAI gateway  •  auth        │
        │  ports/llm-port  ──────────────▶  Ollama adapter               │
        └────────────────────────────┬─────────────────────────────────┘
                                      │  local, no internet egress
                          ┌───────────▼───────────┐
                          │  Ollama  ·  Arabic LLMs │
                          │  ALLaM · Qwen2.5-VL …   │
                          └─────────────────────────┘
```

---

## Highlights

- **Arabic-first reasoning** — built on [ALLaM-7B](https://ollama.com/almaghrabima/ALLaM-Thinking) (SDAIA); shows its step-by-step thinking before the recommendation.
- **Fully local / sovereign** — served by [Ollama](https://ollama.com); no cloud, no data egress. Air-gap friendly.
- **Four modes** — `تحليل` (analysis), `صياغة` (formal rewriting), `برمجة` (code + debug), `ودّي` (companion).
- **Multimodal** — upload **images** (vision model) and **PDFs** (local text extraction) for analysis.
- **OpenAI-compatible API** — `/v1/chat/completions` + `/v1/models`; drop-in for any OpenAI SDK.
- **Auth built in** — session login for the app, Bearer API keys for the API, and an **admin portal**.
- **Hexagonal & modular** — provider behind an `LlmPort`; swap Ollama → vLLM/hosted without touching routes.
- **Uber-inspired UI** — black-and-white, pill geometry, RTL, formal فصحى.

## Architecture (hexagonal / ports & adapters)

```
src/core/
  chat/llm.ts          # domain: modes, system-prompt policy, model selection, stream parsing
  api/openai.ts        # application: OpenAI ⇄ Zaki mapping, API-key guard, CORS
  auth/session.ts      # domain: HMAC-signed sessions, credential verification
  ports/llm-port.ts    # the LLM boundary the app depends on
app/                   # driving adapters (Next.js routes + RTL pages)
lib/                   # thin re-export shims for backward-compatible imports
```

The Next.js routes are *driving adapters*; Ollama is a *driven adapter* behind `LlmPort`.
Domain logic has no framework or provider imports — it is plain, testable TypeScript.

## Tech stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS · Ollama · IBM Plex Sans Arabic.

---

## Quickstart

```bash
# 1) Local model runtime (once)
brew install --cask ollama-app      # macOS; or https://ollama.com/download
ollama serve &

# 2) Pull models
ollama pull almaghrabima/ALLaM-Thinking   # reasoning + rewrite + code (4.3 GB)
ollama pull qwen2.5vl:7b                   # image analysis (optional, ~6 GB)
ollama pull huihui_ai/qwen2.5-abliterate:7b-instruct   # companion (optional)

# 3) App
npm install
cp .env.local.example .env.local
npm run dev        # http://localhost:3000
```

Default login: **`admin` / `zaki-admin-2026`** — change it before publishing (see Configuration).

## Modes

| Mode | Arabic | Behaviour | Model |
|---|---|---|---|
| Analysis | تحليل | step-by-step reasoning → recommendation | `ZAKI_MODEL` |
| Rewrite | صياغة | formal Arabic correspondence | `ZAKI_MODEL` |
| Code | برمجة | write & debug code | `ZAKI_CODE_MODEL` |
| Companion | ودّي | casual Arabic chat | `ZAKI_COMPANION_MODEL` |

Uploaded images route to `ZAKI_VISION_MODEL`; PDFs are parsed locally with `unpdf`.

## OpenAI-compatible API

```bash
curl http://localhost:3000/v1/chat/completions \
  -H "Authorization: Bearer $ZAKI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"zaki","messages":[{"role":"user","content":"عرّف سيادة البيانات"}]}'
```

```python
from openai import OpenAI
client = OpenAI(base_url="http://localhost:3000/v1", api_key="$ZAKI_API_KEY")
r = client.chat.completions.create(model="zaki",
    messages=[{"role":"user","content":"ما عاصمة مصر؟"}])
print(r.choices[0].message.content)
```

Models: `zaki` · `zaki-reason` · `zaki-rewrite` · `zaki-code` · `zaki-chat`.
Reasoning is returned in `reasoning_content`, the answer in `content`. `GET /v1/models` lists them.
Replace with OpenAI later by pointing `base_url` at `https://api.openai.com/v1` — no code change.

## Authentication

- **App (humans):** `/login` → HMAC-signed session cookie; `middleware.ts` guards `/playground` & `/admin`.
- **API (machines):** set `ZAKI_API_KEY`; clients send `Authorization: Bearer <key>`.
- **Admin portal:** `/admin` (admin user only) — model/runtime status, API access, security checklist.

## Configuration

| Variable | Purpose | Default |
|---|---|---|
| `OLLAMA_BASE_URL` | Ollama endpoint | `http://127.0.0.1:11434` |
| `ZAKI_MODEL` | analysis/rewrite model | `almaghrabima/ALLaM-Thinking` |
| `ZAKI_CODE_MODEL` | code mode | = `ZAKI_MODEL` |
| `ZAKI_VISION_MODEL` | image analysis | `qwen2.5vl:7b` |
| `ZAKI_COMPANION_MODEL` | companion mode | = `ZAKI_MODEL` |
| `ZAKI_API_KEY` | public API Bearer key | _(open if unset)_ |
| `ZAKI_AUTH_SECRET` | session signing secret | dev default — **change it** |
| `ZAKI_AUTH_USERS` | `user:sha256hex,…` | `admin` / `zaki-admin-2026` |

Generate a password hash: `printf '%s' 'yourpass' | shasum -a 256`.

## Deployment

Self-host behind any Node host with Ollama reachable:

```bash
npm run build && npm run start    # serves on :3000
```

CI/CD: `.github/workflows/deploy.yml` builds on push to `main` and deploys over SSH.
The target host must have Node 20+, the app, and a reachable Ollama with the models pulled.

## Roadmap

- **RAG / "learn from your data"** — upload regulations/contracts; answer via retrieval (embeddings + vector store), no retraining, inside your infra. (stubbed in the admin portal)
- Scanned-PDF analysis (page → image → vision).
- Per-tenant API keys & usage metering.

## Security & conduct

Zaki is framed as an internal tool for authorized officials: it assists directly with legitimate
official work and avoids unnecessary refusals, while declining to facilitate genuine harm. The
companion mode can use a less-aligned model — keep it off the government-facing modes, keep audit
logs on, and keep human review on sensitive output. Change all default credentials before publishing.

## License

[Apache-2.0](./LICENSE).
