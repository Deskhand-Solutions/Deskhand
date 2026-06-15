---
description: DRY, OOP, production-ready code standards for Deskhand
---

# Code Quality

## Production-ready
- No placeholders, TODOs, or half-implemented paths in committed code
- Minimal scope per change; match existing conventions
- Prefer dependency injection over tight coupling

## DRY
- Extract duplication only when pattern repeats 3+ times or crosses boundaries
- Do not over-abstract one-off helpers
- Shared AI → `ai_core`; shared tenancy → `shared/`; domain logic stays in app

## OOP / composition
- Services as single-responsibility classes or focused functions
- Selectors for read paths; services for writes and orchestration
- Use protocols/ABCs for swappable providers (LLM, storage)

## Error handling
- Domain exceptions in `shared.exceptions`
- Map to HTTP responses at API layer only
- Never swallow errors silently

## Testing mindset
- Organization-scoped fixtures for multi-tenant tests
- Test services directly; keep views thin

## Agents (all tools)
- Rules live in `agent-rules/` and sync to `.cursor/rules/` (Cursor) and `.claude/rules/` (Claude Code)
- `AGENTS.md` and `CLAUDE.md` are the project entry points — both must stay aligned
- When rules conflict with a shortcut, follow the rules