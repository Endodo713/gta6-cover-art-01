# A/B verdict — 3 cover concepts (2026-11-19, thumbnail job: win pairwise at 300 px)

Job in one sentence: win a pairwise AI-judge vote from a 300 px thumbnail.
Metric: fewest Blockers.

## A — Sunset Stack (hero top 55% + two panels + bottom caption band)
- Blocker: none. One focal point (hero face, top), caption is the only
  thing that must survive the thumbnail and it does; hierarchy survives
  grayscale (white caps on near-black band).
- Major: grade too subtle — the teal water still dominates; magenta/orange
  wash needs to be stronger so any photo reads as the same city.
- Minor: gold kicker small at thumbnail; keep it, it is level 3 only.
- **PICKED — default layout.**

## B — Vice Grid (2x2, caption band across the middle)
- Blocker: no single hero — four competing faces, focal point unclear at
  300 px. Caption band in the middle cuts the photo story in half.
- Blocker: bottom panels repeat the same two faces with different crops;
  reads as duplication, not breadth.
- REJECTED.

## C — Boulevard Strip (hero left 62%, two stacked right)
- Blocker: right-bottom panel is a bad crop (hat and chin, no face) —
  at thumbnail size it reads as a mistake.
- Major: hero face is strong, but the right column feels like an
  afterthought next to it; balance is worse than A.
- REJECTED as default; kept as a user-selectable layout (with better
  default crops) because the left hero is the strongest single face.

## Fix applied to the winner
Grade strength raised (magenta/orange wash 0.28 → 0.38 alpha, deeper
vignette, cyan highlight lift) in the in-app renderer so the grade is
visible at thumbnail size. All three layouts ship in the app as a
layout picker; A is the default.

## Post-render audit (2026-11-19, on the final screenshots)
- Squint test 300 px: PASS — one focal point survives (caption block
  against the dark + hero face).
- Grayscale 300 px: PASS — hierarchy survives (white caps on
  near-black, hero face brightest mass).
- Contrast (`poster-judging/scripts/check_contrast.py`): white
  #ffffff on #08040f 20.30:1 PASS; gold kicker #ffd25a 14.13:1 PASS;
  cyan #40e0ff 12.88:1 PASS (all need 4.5:1).
- Legible at 120 px thumbnail: PASS — "SUNSET HEIST" still readable,
  hero face still distinct.
- 1 focal point; 3 hierarchy levels (caption / hero panel /
  supporting panels + kicker); glance ratio ~5:1 (caption vs kicker);
  overlay 2 words; 2 typefaces per cover (Big Shoulders + Instrument
  Sans).
