# Deskhand — Agent Instructions

Canonical instructions for **Cursor**, **Claude Code**, and other coding agents.

## Rules (mandatory — all tools)

| Source | Synced targets |
|--------|----------------|
| `agent-rules/*.md` | **Single source of truth** — edit here only |

After changing rules: `.\scripts\sync-agent-rules.ps1`

| Tool | Loads from |
|------|------------|
| Cursor | `.cursor/rules/*.mdc` |
| Claude Code | `.claude/rules/*.md` |

Follow **every** rule on every task. Scoped rules apply when editing matching paths.

## Stack
- **Backend**: Django 5 + DRF, SQLite (dev), Celery (async AI jobs)
- **Frontend**: React 19 + TypeScript + Vite + Tailwind v4 + React Router

## Repo layout
```
backend/apps/core/       # accounts, organizations, subscriptions, module_registry, administration
backend/apps/ai/ai_core/   # shared LLM, embeddings, usage tracking only
backend/apps/integrations/ # shared external providers (Google, Shopify, …)
backend/apps/modules/      # one Django app per automation module
backend/shared/          # permissions, mixins, exceptions, utils
frontend/src/modules/       # one folder per automation module (content pages)
frontend/src/integrations/  # shared external providers (Google, Shopify, …)
frontend/src/features/        # platform only (auth, route guards)
frontend/src/pages/           # platform shell (dashboard, settings, module catalog)
```

## Commands
| Task | Command |
|------|---------|
| Backend check | `cd backend && .\venv\Scripts\python manage.py check` |
| Migrations | `cd backend && .\venv\Scripts\python manage.py makemigrations && .\venv\Scripts\python manage.py migrate` |
| Sync module DB | `cd backend && .\venv\Scripts\python manage.py sync_platform_modules` |
| Backend run | `cd backend && .\venv\Scripts\python manage.py runserver` |
| Frontend dev | `cd frontend && npm run dev` |
| Frontend build | `cd frontend && npm run build` |
| Backend tests | `cd backend && .\venv\Scripts\python runtests.py` |
| Frontend tests | `cd frontend && npm test` |
| Sync agent rules | `.\scripts\sync-agent-rules.ps1` |

## Testing (mandatory)
- Business logic changes require tests (backend `apps/<app>/tests/`, frontend `*.test.ts`)
- Use `shared/test_utils/factories.py` for backend test data
- Cover: auth, multi-tenancy, module access, integrations, API contracts, registries/schemas
- Run `runtests.py` and `npm test` before completing a task

## Non-negotiables
- One automation module = one Django app in `apps/modules/<name>/`
- Views orchestrate; business logic in `services/`; queries in `selectors/`
- New models use `shared.mixins.BaseModel` (UUID + timestamps)
- All customer data organization-scoped; no cross-tenant access
- Long AI work via Celery, never in HTTP handlers
- Frontend: no `any`, Zod at API boundaries, React Query for server state
- Never duplicate AI logic outside `apps.ai.ai_core`
- Never duplicate third-party API clients outside `apps.integrations`; modules use `get_client_for_organization()`
- Modules reach LLMs only via `apps.ai.ai_core.services.llm_router` (`LLMRouter.generate_for_module(...)`); never hardcode a provider or API key
- Provider API keys / integration credentials are organization-scoped, encrypted at rest (`shared.security.get_secrets_cipher`), and configured by Deskhand staff in the Django admin (`/admin/`)

## Secrets & AI config (env)
- `DESKHAND_SECRETS_KEY` — passphrase enabling Fernet encryption of stored keys (set in prod; empty in dev = insecure obfuscation)
- `DESKHAND_DEFAULT_AI_PROVIDER` — fallback provider when a module has no `ModuleAIBinding` (default `local`)
- Staff set keys/bindings in Django admin (start page → "Integrationen & KI"); customers see masked status read-only in frontend Settings (`/api/v1/ai/overview/`)

## New integration checklist
1. Create `apps/integrations/providers/<slug>/` with `client.py` + `config.py`
2. Subclass `BaseIntegrationClient` and implement `health_check()`
3. Register in `providers/__init__.py` via `register_integration()`
4. Declare `credential_fields` on the `IntegrationDefinition` (drives admin + UI labels)
5. Module services call `apps.integrations.services.get_client_for_organization()`
6. Staff enter credentials in Django admin (`IntegrationConnection`); stored encrypted
7. Frontend UI metadata in `frontend/src/integrations/providers/<slug>/` + `INTEGRATION_REGISTRY`
8. Connection status UI via `IntegrationsPanel` (Settings) and `useOrganizationIntegrations()`
9. Tests: backend `tests/test_connection_service.py` + `tests/test_api.py`; frontend `schemas.test.ts`

## New module checklist
> **Read first (mandatory):** `backend/apps/modules/AGENTS.md` + `frontend/src/modules/AGENTS.md` — the full nothing-forgotten playbooks. Steps below are the summary.

1. `django-admin startapp <name> apps/modules/<name>`
2. Add to `INSTALLED_APPS`
3. Create `api/`, `services/`, `selectors/`, `tasks/`, `models/`, `permissions/`
4. `MODULE_CONFIG` + `register_module()` in `module_registry`
5. `Module` + `OrganizationModule` records
6. Frontend UI at `frontend/src/modules/<name>/` (same snake_case name as backend)
7. Register in `frontend/src/modules/registry.ts` → `MODULE_REGISTRY`
8. Route `/modules/<slug>` via `ModuleRoutePage` (no per-module router entries)
9. AI: call `LLMRouter.generate_for_module(organization=…, module_slug="<slug>", prompt=…)` — provider/key/model resolved per org, usage tracked automatically
10. Tests: `tests/test_services.py`, `tests/test_api.py` (minimum)
## Git & Branching Workflow
- **No Direct Pushes**: Never push directly to `main` or `develop`. All work must occur in `feature/<name>` branches.
- **Pull Requests (PRs)**: Submit PRs to `develop`. Releasing to `main` is done via PR from `develop`. Direct PRs from `feature/*` to `main` are blocked.
- **Reviews & CI/CD**: All PRs require at least 1 approving review on GitHub and must pass all CI validation checks before merging.

## Commit attribution
AI commits MUST include:
```
Co-Authored-By: <Agent Name> <noreply@anthropic.com>
```

## Language
- User-facing copy: German
- Code, comments, rules: English
