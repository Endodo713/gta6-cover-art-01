# A/B verdict — 3 cover concepts for gta6-cover-art-01

Job in one sentence: win a pairwise AI-judge vote from a 300 px thumbnail.
Metric: fewest Blockers.

## A — Sunset Stack (hero top ~62% + two support panels + bottom caption band)
- Blocker: none. One focal point (hero face, top half). Caption is the only
  thing that must survive the thumbnail and it does; hierarchy survives
  grayscale (white caps on near-black band).
- Major: none after grade strengthening. The magenta-to-orange wash is
  strong enough that any photo reads as the same Vice City sunset.
- Minor: gold kicker and masthead are level 2-3 elements; keep them small
  so they don't compete with the caption.
- **PICKED — default layout.**

## B — Vice Grid (2x2, masthead line above caption band)
- Blocker: no single hero — four competing faces, focal point unclear at
  300 px.
- Blocker: bottom panels repeat the same faces with different crops;
  reads as duplication, not breadth.
- REJECTED.

## C — Boulevard Strip (hero left 62%, two stacked right)
- Blocker: none for the hero face, which is the strongest single face.
- Major: right column can feel like an afterthought next to the big hero;
  balance is worse than A at thumbnail size.
- REJECTED as default; kept as a user-selectable layout with better
  default crops because the left hero reads strongest.

## Fix applied to the winner
- Fixed photo draw bug: vertical centering used (ph - h)/2 which pushed
  tall images below the panel; corrected to (h - ph)/2.
- Grade strength raised (magenta/orange wash alpha 0.30 -> 0.38, deeper
  vignette, cyan highlight lift) so the grade is visible at thumbnail size.
- Added role labels on each panel, a masthead line above the caption band,
  and a small gold seal on the cover.
- All three layouts ship in the app as a layout picker; A is the default.

## Post-render audit (2026-11-20, on the final screenshots)
- Squint test 300 px: PASS — one focal point survives (caption block against
  the dark + hero face).
- Grayscale 300 px: PASS — hierarchy survives (white caps on near-black,
  hero face brightest mass).
- Contrast: white on #08040f ~20:1 PASS; gold kicker #ffd25a ~14:1 PASS;
  cyan #40e0ff ~13:1 PASS (all need 4.5:1).
- Legible at 120 px thumbnail: PASS — "SUNSET HEIST" still readable,
  hero face still distinct.
- 1 focal point; 3 hierarchy levels (caption / hero panel / supporting
  panels + kicker + masthead); glance ratio ~5:1; overlay ~2 words;
  2 typefaces per cover (Big Shoulders + Instrument Sans).
