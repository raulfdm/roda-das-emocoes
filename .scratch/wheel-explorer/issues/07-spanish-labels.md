# 07 — Spanish Labels

**What to build:** Spanish joins the switcher as a third Locale, behaving exactly as English does —
switch to it mid-Selection and keep your place.

**Blocked by:** 06

**Status:** ready-for-agent

- [ ] All 130 Spanish Labels are transcribed from `docs/wheels/spanish.png` onto the existing tree
- [ ] Spanish appears in the switcher and behaves identically to the other two Locales
- [ ] Switching to or from Spanish preserves Focus and Selection and updates the query state
- [ ] The structural-identity test now covers all three Locales

## Notes

Mechanical once ticket 06 has proven the mechanism — this is transcription plus one entry in the
switcher.

Spanish Labels are masculine adjectives throughout (`Cansado`, `Estresado`, `Asustado`, `Rechazado`).
This is deliberate and adopted verbatim; see ADR-0004 and the superseded ADR-0002. Do not normalise.

Spanish carries more Collisions than English: `Aislado` serves both *Withdrawn* and *Isolated*, and
`Impotente` serves both *Helpless* and *Powerless*, on top of the duplicates English already has.
Correct data, not defects.
