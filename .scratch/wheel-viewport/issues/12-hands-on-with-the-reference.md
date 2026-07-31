# 12 — Put feelingswheel.app in your hands, on real hardware

**Type:** task

**Blocked by:** —

**Status:** closed — out of scope

## Question

Nothing to decide. This is manual work that unblocks a decision.

Ticket 02 established `feelingswheel.app`'s mechanics from source and from headless Chromium, but
three things resist that method entirely, and all three feed ticket 04's decision about what drives
rotation.

**On a phone**, open <https://feelingswheel.app/>:

- **How does the 3× amplified flick actually feel?** The code says a flick moves the Wheel three
  times as far as your thumb, then coasts on 0.95-per-frame friction with no snap. Numbers cannot
  tell you whether that reads as responsive, as skittish, or as a prize wheel. This is the single
  most useful thing you can report back, because ticket 04 has to choose momentum or no momentum and
  there is no other way to know.
- **Does a tap actually select a feeling?** Selection is bound to `mouseup`, which is a desktop
  event. Whether mobile browsers synthesise it here is untested.
- **Can you read it while turning it?** Your thumb covers part of the Wheel. Where?

**On an iPad**, same URL:

- **Does it rotate at all?** The user-agent test's tablet branch appears to be off, so an iPad should
  fall through to the desktop mouse path — which binds `mousedown`/`mouseup` and would leave touch
  rotation dead. This is a strong reading of the source but was never run on the device. If it is
  broken there, that is worth knowing before we copy any of their input model.

**On desktop**, at <https://feelingswheel.app/>:

- **Can you see the flip pop?** Ticket 02 measured a 180° instantaneous flip as Labels cross 12 and 6
  o'clock, with ~30 of 130 Labels near vertical at any moment. Drag slowly and report whether it is
  invisible, noticeable, or unacceptable. Ticket 03 needs to know whether this is a real defect or a
  theoretical one.
- **Does the drag die when your cursor leaves the box?** `onMouseleave` is bound to the same handler
  as `onMouseup`. Grab near the rim and drag outward.

Record what you find as this ticket's answer. Impressions are the point — "it felt cheap", "it felt
great", "I kept overshooting" are all valid and all more useful here than measurements.

## Notes

HITL, and it is the human's own hands that are the instrument — an agent cannot do this one. Blocks
04.

Cheap and fully parallel: takes minutes, needs no other ticket resolved first.

## Comments

**Closed as out of scope.** This was manual work to unblock decisions about rotation and momentum —
does the flip-pop offend in the hand, is a flick with friction worth having. Those decisions were
descoped after 11 shipped, so the legwork has nothing left to unblock.

Ticket 02 already captured what the reference does, from its source, and that research stands.
