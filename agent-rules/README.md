# Agent Rules (tool-agnostic)

**Single source of truth** for Cursor, Claude Code, and other coding agents.

| Tool | Target (auto-generated) |
|------|-------------------------|
| Cursor | `.cursor/rules/*.mdc` |
| Claude Code | `.claude/rules/*.md` |

## Edit workflow

1. Change files in `agent-rules/*.md` only.
2. Run sync: `.\scripts\sync-agent-rules.ps1`
3. Commit `agent-rules/`, `.cursor/rules/`, and `.claude/rules/` together.

Do not hand-edit `.cursor/rules/` or `.claude/rules/` — changes will be overwritten on sync.
