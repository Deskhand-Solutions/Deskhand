# Backend Module Playbook — READ BEFORE CREATING A MODULE

**Mandatory.** Every customer-facing automation = **one dedicated Django app** in
`apps/modules/<module_name>/`. Follow every step so the module plugs into our
multi-tenancy, module registry, AI router, and integrations without surprises.
Frontend counterpart: [`frontend/src/modules/AGENTS.md`](../../../frontend/src/modules/AGENTS.md).

Reference implementation to copy from: **`apps/modules/email_marketing/`**.

---

## Golden rules (do not break)

- One automation = one app. **Never** put two automations in one app.
- `slug` is identical everywhere: Django app `label`, `MODULE_CONFIG["slug"]`,
  frontend folder, `ModuleDefinition.slug`, route `/modules/<slug>`. Use
  `snake_case` (e.g. `email_marketing`, never `email-marketing`).
- Layering: `api/` orchestrates → `services/` business logic → `selectors/`
  queries → `tasks/` async. Views contain **no** business logic.
- Every customer row references an `Organization`; **every** query is
  organization-scoped. No cross-tenant access, ever.
- New models inherit `shared.mixins.BaseModel` (UUID PK + timestamps).
- AI only via the router; third-party APIs only via the integrations factory
  (see "Wiring" below). No provider SDKs or API keys in module code.

---

## Required structure

```
apps/modules/<module_name>/
├── __init__.py
├── apps.py                 # AppConfig: name, label, ready() → register_module(...)
├── module_config.py        # MODULE_CONFIG dict
├── models/                 # or models.py — BaseModel, organization FK
├── migrations/
├── selectors/              # org-scoped read queries
├── services/               # business logic, AI + integration calls
├── permissions/            # module-access permission class
├── api/
│   ├── __init__.py
│   ├── serializers.py
│   ├── views.py            # orchestration only
│   └── urls.py
├── admin/                  # optional (or admin.py)
└── tests/
    ├── __init__.py
    ├── test_services.py
    └── test_api.py
```

---

## Step-by-step

1. **Create the app**: `apps/modules/<name>/` with an `apps.py` that registers
   the module on startup:
   ```python
   class ChatbotConfig(AppConfig):
       default_auto_field = "django.db.models.BigAutoField"
       name = "apps.modules.chatbot"
       label = "chatbot"

       def ready(self) -> None:
           from apps.core.module_registry.registry import ModuleDefinition, register_module
           from apps.modules.chatbot.module_config import MODULE_CONFIG
           register_module(ModuleDefinition(**MODULE_CONFIG))
   ```
2. **`module_config.py`** — single source of metadata:
   ```python
   MODULE_CONFIG = {
       "slug": "chatbot",
       "name": "Chatbot",
       "description": "Konversations-KI für Kundenanfragen.",
       "icon": "message-circle",
       "api_prefix": "/api/v1/modules/chatbot",
       "frontend_route": "/modules/chatbot",
       "sort_order": 40,
   }
   ```
3. **Register the app** in `config/settings/base.py` → `LOCAL_APPS`
   (`"apps.modules.chatbot"`).
4. **Models** (`models/` or `models.py`): inherit `BaseModel`, add an
   `organization` FK (`on_delete=CASCADE`, `related_name=...`). Then
   `python manage.py makemigrations <label>`.
5. **Selectors** (`selectors/`): every function takes `organization` (or
   `organization_id`) and filters by it.
6. **Services** (`services/`): business logic. Inject dependencies. For AI and
   integrations use the wiring below — never instantiate providers directly.
7. **Permissions** (`permissions/`): gate access to the org's enabled modules:
   ```python
   from rest_framework.permissions import BasePermission
   from apps.core.module_registry.services import ModuleAccessService

   class RequiresChatbotModule(BasePermission):
       message = "Modul ist für diese Organisation nicht freigeschaltet."
       def has_permission(self, request, view) -> bool:
           org = getattr(request, "organization", None)
           return org is not None and ModuleAccessService.is_enabled(org, "chatbot")
   ```
   Combine with `IsAuthenticated` + `IsOrganizationMember`. (Function views may
   use `@module_required("chatbot")` from `shared.permissions`.)
8. **API** (`api/`): thin views (orchestrate only), serializers, and `urls.py`.
   Then mount in `config/urls.py`:
   `path("api/v1/modules/<name>/", include("apps.modules.<name>.api.urls"))`.
9. **DB records**: a `Module` row + `OrganizationModule` per org. Run
   `python manage.py sync_platform_modules` (uses `module_registry.platform_catalog`)
   to create/assign. The sidebar loads enabled modules from the API.
10. **Admin** (optional): register module models for staff visibility.
11. **Tests** (`tests/`): `test_services.py` (business logic) + `test_api.py`
    (auth, **organization scope**, response shape). Use
    `shared/test_utils/factories.py`.

---

## Wiring (the whole point — flexible by design)

**AI / LLM** — one call, provider + org API key + model + usage tracking resolved
automatically (staff pick the provider per module in the Django admin via
`ModuleAIBinding`):
```python
from apps.ai.ai_core.services.llm_router import LLMRouter

response = LLMRouter.generate_for_module(
    organization=organization,
    module_slug="chatbot",
    prompt=prompt,
)
# response.content / response.model / response.tokens_*
```
Need the client without auto-tracking? `LLMRouter.get_llm_for_module(...)`.
**Never** import `openai`/`anthropic`/etc. or read an API key in a module.

**Integrations** (Slack, Google, Shopify, …) — one factory returns a configured,
org-scoped client (credentials are entered by staff in the admin, encrypted):
```python
from apps.integrations.services import get_client_for_organization

client = get_client_for_organization(organization_id=organization.id, provider_slug="slack")
```
**Never** import a provider SDK in a module. New providers go in
`apps/integrations/providers/<slug>/` (see `apps/integrations` rules).

---

## Before you finish (don't forget)

- [ ] App in `LOCAL_APPS`; `ready()` registers the module
- [ ] `slug` identical in backend, frontend, registry, route
- [ ] Models org-scoped + migration created and applied
- [ ] Views thin; logic in services; queries in selectors
- [ ] Module-access permission enforced on every endpoint
- [ ] API mounted in `config/urls.py`
- [ ] `sync_platform_modules` run; module assignable per org
- [ ] AI via `LLMRouter`; integrations via `get_client_for_organization`
- [ ] Frontend built per `frontend/src/modules/AGENTS.md`
- [ ] `python manage.py check` clean
- [ ] `python runtests.py` green (service + API/org-scope tests added)
