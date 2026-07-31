# 09 — Accessibility twin and keyboard

**What to build:** the Wheel is usable without pointing at it. The same taxonomy is exposed as a real
nested list for assistive technology, and the Wheel itself can be traversed entirely by keyboard.

**Blocked by:** 04

**Status:** ready-for-agent

- [ ] The tree is exposed as a genuine nested list, letting a screen-reader user navigate the
      taxonomy structurally rather than fighting a graphic
- [ ] The list and the Wheel are the same data and the same state — not a second UI with its own copy
- [ ] Every Node in the Wheel is reachable and operable by keyboard, including descending, ascending
      and selecting
- [ ] Focus and Selection are both announced meaningfully — passing through a Node reads differently
      from settling on one
- [ ] Visible focus indication throughout
- [ ] Labels and the Path readout are announced in the active Locale, with the document language set
      accordingly

## Notes

This is the same tree in its structural form, not a fallback or a separate mobile view. Building it
as a parallel implementation with its own state is the failure mode to avoid.

Runs in parallel with 05–08 — it only needs Selection to exist, not query state, Locale switching or
search. If it lands after those, extend it to cover them.
