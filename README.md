# Notification Forwarder — Minimal (Time-boxed)

> Minimal, time-boxed implementation that fulfils the core brief. I kept scope tight and added TODO comments for follow-ups so I can be rested for the interview.

## Overview

- **Framework:** TypeScript + Fastify
- **Endpoints:**
  - `POST /` — accepts a JSON notification and **forwards only** `Type: "Warning"` to Slack.
  - `GET /health` — simple liveness check.
- **Forwarding rule:** `Warning` → forwarded; `Info` (and others) → accepted but **not** forwarded.
- **Messenger:** Slack Incoming Webhook (`{ text: "…" }` payload).
- **Storage:** Process-local, in-memory only (no external DB, as per brief).
- **Auth:** None (intentionally out of scope).

## Quickstart

```bash
# Node 18+ recommended
pnpm i            # or: npm i / yarn
pnpm dev          # or: npm run dev
```

### Configuration (Slack)

Provide your Slack Incoming Webhook URL:

```bash
export SLACK_WEBHOOK_URL="https://hooks.slack.com/services/XXX/YYY/ZZZ"
```

> Secrets must not be committed. In CI, use encrypted variables / secrets.

## API

### POST `/`

**Headers**
```
Content-Type: application/json
```

**Body (JSON)**
```json
{
  "Type": "Warning | Info | ...",
  "Name": "Backup Failure",
  "Description": "The backup failed due to a database problem…"
}
```

**Behaviour**
- If `Type === "Warning"` → formats a Slack message and POSTs to the webhook.
- Otherwise → **not** forwarded; returns a friendly message.

**Responses**
- `200 OK` with body `"OK"` when forwarded.
- `200 OK` with body `"Only notifications of type 'Warning' are forwarded"` when skipped.
- `4xx` for invalid payload (when schema validation is enabled).
- `5xx`/`502` if Slack returns non-OK (when error surfacing is enabled).

**Example**
```bash
curl -X POST http://localhost:3000/   -H "Content-Type: application/json"   -d '{"Type":"Warning","Name":"Backup Failure","Description":"DB is locked"}'
```

### GET `/health`
Returns a small JSON (e.g., `{ "status": "ok" }`) to confirm the service is up.

## Tests

```bash
pnpm test
```
Unit tests cover:
- `Warning` → Slack webhook called with `{ text: ... }`, returns `OK`.
- Non-`Warning` → not forwarded.
- (Optional) invalid body → `400` when schema is enabled.
- Webhook failure → surfaced as an error (if enabled).

> Slack calls are mocked; no external requests are made during tests.

## Multi-consumer considerations

- **Stable contract:** explicit request/response shapes and predictable status codes.
- **Minimal surface area:** one POST + `/health` keeps adoption simple.
- **Stateless core:** any in-memory bits are non-critical and per-process.
- **Versioning:** route can be moved to `/v1/notifications` in a follow-up without breaking callers (documented plan).
- **CORS:** server-to-server by default; enable only if browser clients are needed.

## Planned but not included (time-boxed)

- **Docker**: A minimal container image was planned but deferred for time. Intended approach:
  - Base: `node:24-alpine`, install deps, copy source, run as non-root, expose `3000`, `CMD ["pnpm","start"]`.
  - Would add a `.dockerignore` and build args for `NODE_ENV`.
- **GitHub Actions CI**: Also planned but deferred. Intended baseline workflow:
  - Triggers on `push`/`pull_request`.
  - Steps: checkout → setup Node → install deps (pnpm) → run tests → build → (optional) lint.
  - Use `SLACK_WEBHOOK_URL` as an encrypted secret in the environment (tests should mock the webhook).

## Assumptions

- Clients send `Content-Type: application/json` and capitalised keys (`Type|Name|Description`). Key normalisation is planned.
- Slack is the target messenger; Discord (or others) can be added behind the same adapter boundary.

## TODO / Next steps (also marked in code)

- Add strict JSON schema validation + normalise capitalised keys.
- Read webhook from `SLACK_WEBHOOK_URL`; handle non-OK responses with a `502` path and timeout.
- Optional versioned route `/v1/notifications` and tiny idempotency cache (e.g., `Idempotency-Key` with short TTL).
- Optional ring buffer (last N notifications) to showcase in-memory storage explicitly.
- Health detail (`/health`) and light structured logging.
- Add **Dockerfile** and **GitHub Actions** CI workflow as outlined above.

## Limitations

- In-memory storage is ephemeral and not shared across processes/containers.
- No retry/back-off for webhook failures (kept intentionally minimal).
- Basic Slack formatting via `text`; no Blocks yet.

---

**Status:** Minimal core complete with TODOs noted. Docker and CI were planned but intentionally left out to keep the scope tight before the interview.
