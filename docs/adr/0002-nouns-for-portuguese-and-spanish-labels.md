# Portuguese and Spanish Labels are nouns, English Labels are adjectives

Status: superseded by ADR-0004

**This decision was reversed before any Labels were written.** It was made while we believed no
Portuguese or Spanish version of the Wheel existed and that all 260 Labels would have to be authored
from scratch. Published translations of both were subsequently found, and ADR-0004 adopts them
verbatim. The original reasoning is kept below because the problem it identified is real and will
resurface if a fourth Locale is ever authored rather than sourced.

---

Every Label on the Wheel describes the person feeling it, and in Portuguese and Spanish that means
gender agreement: *isolado/isolada*, *surpreso/surpresa*, *abandonado/abandonada*. Roughly half the
Wheel inflects. Nominalising the pt and es Labels — *Sobrecarga* rather than *sobrecarregado(a)* —
removes the agreement problem entirely, since nouns carry fixed gender of their own, and it matches
how emotions are conventionally named in both languages. English keeps Roberts' original adjectives.

## Considered options

- **Masculine default** (*estressado*) — conventional and shortest, but reads as written-for-someone-else
  to half the audience, every single time.
- **Dual form** (*estressado(a)*) — explicitly inclusive, but adds ~3 characters to every inflecting
  Label, and Label length is the binding constraint at the rim.

## Why it was superseded

The published Portuguese wheel is *mixed* — nouns (`Cansaço`, `Solidão`, `Humilhação`, `Frustração`)
sitting alongside adjectives (`Assustado`, `Ocupado`, `Magoado`). The published Spanish wheel is
masculine adjectives throughout (`Cansado`, `Estresado`, `Asustado`, `Rechazado`) — exactly the
option rejected above. Normalising either would have meant rewriting ~150 Labels by hand and
shipping wheels that match no version anyone has seen. Recognisability beat consistency.
