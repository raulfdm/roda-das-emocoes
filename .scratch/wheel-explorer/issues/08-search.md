# 08 — Search

**What to build:** someone who half-remembers a word can jump straight to it instead of descending
the Wheel. Typing into a search field matches Labels in the active Locale, shows each hit as a full
Path, and selecting one takes you to that Node on the Wheel.

**Blocked by:** 06

**Status:** ready-for-agent

- [ ] A search field matches Labels within the active Locale
- [ ] Matching is case-insensitive and accent-insensitive, so `estresse`, `ansiedade` and `sobrecarga`
      typed without diacritics all return results
- [ ] Each result is rendered as its full Path, not a bare word
- [ ] Selecting a result moves the Focus to that Node and makes it the Selection
- [ ] Clearing the search returns to the Wheel without disturbing the current Selection
- [ ] Search works on a phone without the field obscuring the Wheel

## Notes

Showing full Paths is required, not cosmetic. Several Labels genuinely appear at more than one Node —
Portuguese `Desapontado` matches three, and `Confiança`, `Satisfação`, `Excitação` and `Ansiedade`
each match two at different depths. The Path is the only thing that tells them apart, so a result
list of bare words would be actively misleading.

Blocked by 06 rather than 04 so that accent-insensitive matching can be verified against real
Portuguese data rather than English, which has no diacritics to exercise it.

**Relaid out, not rescoped.** The last criterion above — "search works on a phone without the field
obscuring the Wheel" — was not really met: the field shipped full-width above the Wheel with its own
heading and a `shadow-sm`, competing with the Path readout for the strip a phone can least spare.
`.scratch/wheel-prune/issues/04-search-into-the-header.md` moves it into the header beside the Locale
switcher. What search *does* — accent-insensitive matching, full-Path results, `pickResult`'s
behaviour — is untouched.
