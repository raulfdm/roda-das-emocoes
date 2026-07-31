# Labels are adopted verbatim from the published wheels

Supersedes ADR-0002.

Published Portuguese and Spanish renderings of Roberts' Wheel both exist and both preserve his exact
structure — 7 Cores, 41 Secondaries, 82 Tertiaries — aligned branch for branch and position for
position with the English original. We adopt all three Label sets exactly as published, authoring
nothing.

## Correction

"Verbatim" was written against the risk of a contributor rewriting the wheels' *editorial* choices —
de-gendering the Spanish, nominalising the Portuguese, adjudicating Collisions. Transcribing all 390
Labels turned up a case this record did not anticipate: the images are misprinted in four places.

**Misprints are corrected; editorial choices are not.** The line is whether the source made a choice
or made a mistake. A masculine Spanish adjective is a choice. A missing letter is not, and neither is
a word pasted into the wrong slot.

The four, all listed in the header of `src/lib/wheel/labels.ts` so nobody restores them against the
images later:

| Node                    | Printed         | Ours         |
| ----------------------- | --------------- | ------------ |
| `Mal › Ocupado` (pt)    | `Agradecimento` | `Apressado`  |
| `Raiva › Amargura` (pt) | `Indgnado`      | `Indignado`  |
| `Raiva › Desapontado`   | `Resentido`     | `Ressentido` |
| `Feliz` Core (es)       | `Felíz`         | `Feliz`      |

Only the first changes meaning: the Portuguese wheel prints *Agradecimento* ("thankfulness") where
English has *Rushed* and Spanish has *Apurado*. Left as printed it would have quietly sent someone to
the wrong feeling, which is the exact failure the data-invariant test exists to prevent — but no test
can catch a Label that is well-formed and simply wrong, so it is recorded here instead.

## Consequences

- **No Labels are original work.** What was the largest and riskiest content task in the project
  disappears entirely. There are no Collisions to adjudicate and no nominalisation judgements to
  make.
- **The three Locales share one canonical tree**, so a Selection survives a Locale switch in every
  direction with no holes. This is what makes "change the language, keep your place" possible at all.
- **Spanish reads masculine-default** (`Cansado`, `Asustado`, `Rechazado`) and **Portuguese mixes
  registers** (`Cansaço` beside `Ocupado`). Both are accepted costs. A future contributor will notice
  the inconsistency and want to "fix" it — this record exists to stop that.
- **Collisions are now data, not defects.** Because the translations are faithful, each Locale
  inherits duplicate Labels and adds its own. Portuguese `Desapontado` lands on three separate Nodes;
  `Rejeição` on two different Secondaries; `Confiança`, `Satisfação`, `Excitação` and `Ansiedade`
  each appear at two different depths. Spanish adds `Aislado` (for both *Withdrawn* and *Isolated*)
  and `Impotente` (for both *Helpless* and *Powerless*) on top of the four English already has.
  **Nothing may assume Labels are unique within a Locale**, least of all a validation rule.
