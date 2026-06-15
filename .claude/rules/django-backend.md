---
description: Django + DRF patterns for Deskhand backend
paths: backend/**/*.py
---

# Django Backend

## App naming
- Core: `apps.core.<app>` with explicit `label` in AppConfig
- AI: `apps.ai.ai_core`
- Integrations: `apps.integrations` (providers under `providers/<slug>/`)
- Modules: `apps.modules.<module_name>`

## Models
- New business models: inherit `shared.mixins.BaseModel` (UUID PK + timestamps)
- Legacy core models may use integer PK until migrated
- All customer data belongs to an Organization
- Soft-delete customer resources when appropriate

## API (DRF)
- Views orchestrate only; no business logic in views
- Business logic → `services/`
- Complex queries → `selectors/`
- Serializers in `api/` or `serializers.py` per app convention
- Each module exposes its own API under `/api/v1/<module>/`

## Async
- Never run unbounded AI work in HTTP requests
- Target: Celery for AI processing, document ingestion, embeddings, reports, exports
- Until Celery is wired: synchronous service calls with timeouts; add `tasks/` stubs when adding modules

## Multi-tenancy
- Every query must be organization-scoped
- Never allow cross-organization access
- Validate permissions server-side; never trust frontend

## Tests (mandatory)
- Put tests in `apps/<app>/tests/` — `test_services.py`, `test_api.py`, `test_selectors.py`
- Reuse `shared/test_utils/factories.py` for users, orgs, modules
- API changes: add `APITestCase` covering auth, org scope, response shape
- Run `python runtests.py` before finishing

## OOP / DRY
- Prefer composition over inheritance
- Inject dependencies into services (provider, repository)
- Reuse `ai_core` services; do not duplicate LLM/embedding logic
- Reuse `integrations` clients via `get_client_for_organization()`; no provider SDKs in modules