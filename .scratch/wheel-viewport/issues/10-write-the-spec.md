# 10 — Write the spec and its implementation issues

**Type:** task

**Blocked by:** 01, 05, 07, 09 — **all clear.** 01 and 05 resolved negative, 09 amended ADR-0001 and
wrote ADR-0008, 07 was dissolved by ADR-0005. This is the frontier and the last of the destination.

**Status:** open

## Question

Nothing left to decide — this is the destination being written down.

Produce:

- `.scratch/wheel-viewport/spec.md`, in the shape of `.scratch/wheel-explorer/spec.md`.
- Numbered implementation issues at `.scratch/wheel-viewport/issues/`, in the shape of the
  `wheel-explorer` ones — `**What to build:**`, `**Blocked by:**`, a `Status:` triage label from
  `docs/agents/triage-labels.md`, then acceptance criteria as checkboxes, then Notes.

Every decision from tickets 01–09 lands in one of those two places, or in an ADR from 09. Nothing
decided on this map may be left only in a resolution comment.

The implementation issues are numbered from `01` in their own sequence — they are a different series
from these wayfinding tickets, and the two should not be confused. Consider whether the wayfinding
tickets move to a subdirectory to keep that clear.

## Notes

AFK once its blockers are resolved: by then there is nothing left to ask.

If this ticket turns out to want decisions that no earlier ticket made, that is a charting failure —
open a ticket for the decision rather than making it here.
