# Frontend Module Playbook — READ BEFORE CREATING A MODULE

**Mandatory.** Each automation module's UI = **one folder** in
`src/modules/<module_name>/`, mirroring the Django app. Backend counterpart:
[`backend/apps/modules/AGENTS.md`](../../../backend/apps/modules/AGENTS.md).

Reference implementation to copy from: **`src/modules/email_marketing/`**.

---

## Golden rules (do not break)

- Folder name = backend app folder = `slug`, in `snake_case`
  (e.g. `email_marketing`, never `email-marketing`).
- `ModuleDefinition.slug` **must** equal `MODULE_CONFIG["slug"]` in the backend.
- Route is always `/modules/<slug>`, resolved by `ModuleRoutePage`. **Never** add
  a per-module entry to the router.
- No `any`. Validate every API response with **Zod** at the boundary.
- Server state via **TanStack React Query**. No raw `fetch` in pages — use
  `shared/api/client` (`apiRequestValidated`) wrapped in the module's `api.ts`.
- Reuse `shared/components` primitives + design tokens. No hardcoded colors, no
  inline styles (Tailwind only).

---

## Required structure

```
src/modules/<module_name>/
├── index.ts              # ModuleDefinition export (+ Page re-export)
├── <ModuleName>Page.tsx  # route page — composition only
├── api.ts                # API wrappers (apiRequestValidated)
├── schemas.ts            # Zod schemas + inferred types
├── components/           # optional, module-only UI
├── hooks/                # optional, module-only hooks
└── schemas.test.ts       # Zod parse/reject + slug alignment (Vitest)
```

---

## Step-by-step

1. **Create the folder** `src/modules/<name>/`.
2. **`schemas.ts`** — Zod schemas for every API payload + `z.infer` types:
   ```ts
   import { z } from 'zod'
   export const chatMessageSchema = z.object({ id: z.string(), text: z.string() })
   export type ChatMessage = z.infer<typeof chatMessageSchema>
   ```
3. **`api.ts`** — typed wrappers (no raw fetch, no `any`):
   ```ts
   import { apiRequestValidated } from '../../shared/api/client'
   import { z } from 'zod'
   import { chatMessageSchema } from './schemas'
   export const fetchMessages = () =>
     apiRequestValidated('/api/v1/modules/chatbot/messages/', z.array(chatMessageSchema))
   ```
4. **`<ModuleName>Page.tsx`** — composition only; data via React Query + the
   `api.ts` wrappers; reuse `Button`, `Card`, `PageHeader`, `LoadingState`,
   `ErrorAlert`, `StatusBadge` from `shared/components`.
5. **`index.ts`** — export the `ModuleDefinition` (shape: `slug`, `name`,
   `description`, `Page`):
   ```ts
   import type { ModuleDefinition } from '../types'
   import { ChatbotPage } from './ChatbotPage'
   export { ChatbotPage } from './ChatbotPage'
   export const chatbotModule: ModuleDefinition = {
     slug: 'chatbot',
     name: 'Chatbot',
     description: 'Konversations-KI für Kundenanfragen.',
     Page: ChatbotPage,
   }
   ```
6. **Register** in `src/modules/registry.ts` → add to `MODULE_REGISTRY`. That is
   the **only** place modules are registered. The sidebar shows a module only
   when (a) it's in the registry **and** (b) the backend enabled it for the org.
7. **Tests** (`schemas.test.ts`): Zod parse + reject cases, and a slug-alignment
   assertion (registry slug matches the backend slug).

---

## Do NOT

- Put module pages in `src/pages/` (platform shell) or `src/features/`
  (auth/guards only).
- Add a second module registry, or a router entry per module.
- Embed provider connect / API-key UI in a module. Integrations and AI keys are
  managed by Deskhand staff in the Django admin and shown read-only under
  Settings (`src/ai`, `src/integrations`). Modules just consume the backend.
- Call provider SDKs from the frontend.

---

## Before you finish (don't forget)

- [ ] Folder name = backend app = `slug` (`snake_case`)
- [ ] `ModuleDefinition.slug` === backend `MODULE_CONFIG["slug"]`
- [ ] Registered in `src/modules/registry.ts` (`MODULE_REGISTRY`)
- [ ] Page is composition-only; API in `api.ts`; Zod in `schemas.ts`; no `any`
- [ ] React Query for server state; `shared/components` reused
- [ ] `schemas.test.ts` covers parse/reject + slug alignment
- [ ] `npm test` green and `npm run build` (typecheck) passes
