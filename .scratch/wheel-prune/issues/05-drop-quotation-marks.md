# 05 — Drop quotation marks around Labels

**What to build:** one convention across three Locales. The app's own words stop wrapping a Label in
quotation marks of any kind, matching the accessibility twin's labels, which already do this.

**Blocked by:** —

**Status:** ready-for-agent

- [ ] `words.ts:51-52` — PT `chooseFocus` and `openSelection` drop `«»`: `Escolher ${label}`,
      `Abrir ${label}`
- [ ] `words.ts:105-106` — ES the same: `Elegir ${label}`, `Abrir ${label}`
- [ ] `words.ts:78-79` — EN drops `“”`: `Choose ${label}`, `Open ${label}`
- [ ] `words.ts:95` — the ES tagline keeps its quotes but takes straight ones:
      `De "me siento mal" a la palabra exacta, en tres toques.`
- [ ] No `«`, `»`, `“` or `”` remains anywhere in `src/lib/words.ts`
- [ ] `descend` and `select` (`words.ts:61-62` and their EN/ES counterparts) are unchanged — they
      were already right

## Notes

The file currently holds three conventions at once: `«»` for PT and ES, `“”` for EN, and nothing at
all for the accessibility twin's `descend`/`select`. This picks the one that already had precedent
rather than inventing a fourth.

`«»` is the European convention; in a Portuguese-first app it reads as imported.

The ES tagline is a different case and is deliberately not stripped: it quotes a *phrase* someone
might say, not a Label, and needs delimiting to make sense. Straight quotes match what PT
(`words.ts:41`) and EN (`words.ts:68`) already do with the same sentence.

**This touches only the app's own words.** ADR-0004 governs Labels, which are transcribed verbatim
from the published wheels — nothing in this issue goes near `wheel.ts`.
