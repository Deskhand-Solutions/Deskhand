---
description: Frontend integration generation — dynamic catalog driven setup
paths: frontend/src/integrations/**/*
apply: scoped
---

# Frontend Integration Rules

When adding a provider under `backend/apps/integrations/providers/<slug>/`, no frontend directory should be created. The UI is completely dynamic and driven by the backend catalog API.

## Layout
```
frontend/src/integrations/
├── registry.ts           # getIntegrationMonogram()
├── types.ts              # Type definitions
├── api.ts                # fetchIntegrationCatalog, saveOrganizationIntegration, etc.
├── schemas.ts            # Zod schemas (validates auth_type and credential_fields)
├── hooks/
│   └── useOrganizationIntegrations.ts
└── components/
    ├── IntegrationCard.tsx
    └── IntegrationsPanel.tsx
```

## Rules
- NEVER create hardcoded directories or static forms for individual providers under `src/integrations/providers/`.
- `IntegrationsPanel` dynamically loops through the active provider's `credential_fields` (key, label, secret, help_text) to generate `<Input>` fields at runtime.
- Connection states and mutations (disconnect, save) are handled via `useOrganizationIntegrations` hooks.
- All API validation must match the dynamic catalog schema (Zod in `schemas.ts`).
