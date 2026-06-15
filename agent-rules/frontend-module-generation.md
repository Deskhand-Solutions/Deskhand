---
description: Rules for creating automation module UI in frontend/src/modules/
paths: frontend/src/modules/**
apply: scoped
---

# Frontend Module Generation

> **MANDATORY:** Before creating or changing a module's UI, read the full playbook
> [`frontend/src/modules/AGENTS.md`](../frontend/src/modules/AGENTS.md) (and the
> backend one at `backend/apps/modules/AGENTS.md`). It is the authoritative,
> nothing-forgotten checklist — this rule is the short summary.

When creating UI for `backend/apps/modules/<module_name>/`, mirror the backend name in the frontend.

## Required structure
```
frontend/src/modules/<module_name>/
├── index.ts              # ModuleDefinition export + page export
├── <ModuleName>Page.tsx  # Main route page (composition only)
├── api.ts                # API calls for this module
├── schemas.ts            # Zod schemas + inferred types
├── components/           # optional, module-only UI
├── hooks/                # optional, module-only hooks
└── schemas.test.ts       # or registry.test.ts when contract-critical
```

## Naming
- Folder name **must** match Django app folder: `email_marketing`, not `email-marketing`
- `slug` in `ModuleDefinition` must match `MODULE_CONFIG["slug"]` in backend
- Route: `/modules/<slug>` via `ModuleRoutePage`

## Registration steps
1. Create folder under `src/modules/<module_name>/`
2. Export `ModuleDefinition` from `index.ts`
3. Register in `src/modules/registry.ts` → `MODULE_REGISTRY`
4. Backend enables module per organization (sidebar loads from API)
5. Add Vitest tests for `schemas.ts` and/or `registry.ts` slug alignment

## Layering
- Page components orchestrate UI; no raw `fetch` in pages
- API wrappers in module `api.ts`; validate with Zod in `schemas.ts`
- Reuse `shared/components/`, `shared/api/client.ts`, React Query
- Cross-module code belongs in `shared/`, not in another module folder

## Do not
- Put automation module pages in `src/pages/` (platform shell only)
- Put automation module pages in `src/features/` (`features/` = auth, shell concerns)
- Duplicate module registry outside `src/modules/registry.ts`
