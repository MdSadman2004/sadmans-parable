---
name: "Sadman's Parable"
description: "An authored bureaucratic universe opening into an analog planetarium."
colors:
  ink: "#10272c"
  paper: "#ebe4c7"
  soft: "#c0c7b5"
  brass: "#d4b573"
  rule: "#496160"
  button-surface: "#16343a"
  button-hover: "#254b4c"
  primary-hover: "#d5bd85"
  world-ink: "#14292d"
  world-brass: "#b99a58"
  world-wood: "#50392c"
  world-wall: "#c6c5a8"
  world-green: "#356961"
  world-red: "#b45143"
  world-cream: "#e6dfbd"
typography:
  display:
    fontFamily: "'Libre Caslon Display', Georgia, serif"
    fontSize: "clamp(70px, 7.9vw, 114px)"
    fontWeight: 400
    lineHeight: 0.9
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "'Libre Caslon Display', Georgia, serif"
    fontSize: "clamp(40px, 4.1vw, 63px)"
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: "-0.015em"
  body:
    fontFamily: "Manrope, 'Segoe UI', sans-serif"
    fontSize: "15px"
  caption:
    fontFamily: "Manrope, 'Segoe UI', sans-serif"
    fontSize: "clamp(15px, 1.3vw, 19px)"
    lineHeight: 1.65
  fine:
    fontFamily: "Manrope, 'Segoe UI', sans-serif"
    fontSize: "12px"
    lineHeight: 1.7
spacing:
  menu-action-gap: "10px"
  stacked-action-gap: "9px"
  button-block: "11px"
  button-inline: "20px"
components:
  button-primary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    padding: "11px 20px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.ink}"
  button-secondary:
    backgroundColor: "{colors.button-surface}"
    textColor: "{colors.paper}"
    padding: "11px 20px"
  button-secondary-hover:
    backgroundColor: "{colors.button-hover}"
    textColor: "{colors.paper}"
---

# Design System: Sadman's Parable

## Overview

**Creative North Star: "Analog planetarium"**

Assigned world and thesis are already pinned in `.impeccable/surface.md:4,8–12`: an analog planetarium, and a bureaucratic universe arguing with its visitor. This is a bounded record of that completed assignment, not new branding.

This document records the implemented world, not a proposed redesign. The pinned direction is an analog planetarium: petrol darkness and aged brass frame an institutional office that opens into archives, astronomical machinery, and an impossible garden. The first-person artifact fills the viewport. Overlays support the experience rather than presenting the game as a dashboard or card grid.

The Building begins as an unreliable administrator and becomes capable of company without another assignment. Provocation belongs to finite fictional tasks, never to pause, settings, or leaving. Spatial surprises emerge through the player's own exploration; the game does not move itself through a demonstration.

**Key Characteristics:**
- Procedural architecture, readable plaques, familiar office objects, and monumental brass mechanisms.
- Editorial serif titles paired with compact sans-serif instructions and dialogue.
- Recurring rectangular door frames and signs; cosmic circles are concentrated in the orrery, stars, and ocean rings.
- Honest exits around bounded moving-goalpost tasks, followed by wonder and quiet.

**Implementation and review basis.** `src/main.js` owns the renderer, manual input, camera, overlays, narration, checkpoints, and explicit QA mode; `src/world.js` builds/disposes the scenes and interaction geometry; `src/rules.js` owns movement/collision and choice outcomes; `src/story.json` holds 98 authored line entries and twelve ending records; `src/audio.js` synthesizes local sound; `src/style.css` and the root `index.html` define the DOM interface. Some authored lines are not invoked by the current runtime. The deliverable is `Sadman's Parable.html`, not the root source template.

The current standalone HTML is 1,102,702 bytes, SHA-256 `7f7f1fff59327cb0e938b8a3d8d0a4e82554005b87fdf9138229bdab6b02e56f`. The 2026-10-04 finish review verified the original ten-room build (1,079,685 bytes) independently, and an independent expansion review then found one HIGH defect (four `to_archive` doors had no reducer case, so the quiet room's only exit was dead); that defect and every LOW finding were fixed and re-verified. The current numbers are counted from fresh runs after those fixes: 33 reducer tests with zero failures or skips, 53 live browser checks with zero game errors and one real E-keypress regression that walks the repaired quiet-room exit, and a 74-of-74 raycast reachability sweep across 16 spaces. The `dist/index.html` and the playable ZIP contain the same bytes as the standalone file.

**Visual limitation.** This was principally code/evidence review, without direct human or remote-model inspection of the screenshots. Local SmolVLM2 descriptions are fallible and do not certify exact typography, illumination, composition, or contrast. `qa/title.png` is the normal title capture; the model's title description concerns the older QA `title-final.png`. Room QA captures can retain the previous subtitle because the relocation helper does not narrate room entry; ordinary `goRoom` supplies the correct entry text (`src/main.js:24,56`). No pixel-perfect, WCAG-conformance, full human playthrough, long-duration stability, or locked-60-fps claim is made.

## Colors

The interface palette is defined by the frontmatter and `src/style.css:1`. It separates warm paper text and a restrained brass accent from petrol surfaces. The 3D palette is a separate material vocabulary, not a copy of the UI colors.

### Primary
- **Brass:** title emphasis, speaker labels, keyboard instruction headings, interaction feedback, and focus outlines.
- **Paper:** main text and primary action surface. Primary actions invert to Ink text.

### Secondary
- **Button Surface / Button Hover:** restrained, opaque secondary controls in overlays.
- **Primary Hover:** warmer paper-brass feedback on the primary button.

### Neutral
- **Ink:** document body and canvas fallback background.
- **Soft:** subordinate instructions, collection descriptions, and fine print.
- **Rule:** dividers, secondary button borders, and scrollbar thumbs.

The seven `world-*` frontmatter colors are the literal material palette from `src/world.js:3`, losslessly expressed as CSS hex values rather than Three.js integer syntax. World Ink, Brass, Wood, Wall, Green, Red, and Cream retain the source's roles. The indoor carpet texture starts at `#727553`; the button room uses `#7d9d91` tile. Orrery brass is `0xcfaf64`, paired with emissive sea-green. The garden shifts to blue-green fog (`0x294c59`), an ocean below the platform (`0x316d74`), and a warm distant sun (`0xf3c797`). Rendered colors are affected by lighting and ACES tone mapping; these numbers are not sampled screenshot colors.

**The Fiction Boundary Rule.** Red and changing counters may provoke within the story; primary navigation, pause, and exit feedback must remain honest.

## Typography

**Display Font:** Libre Caslon Display, with Georgia and serif fallbacks.  
**Body Font:** Manrope, with Segoe UI and sans-serif fallbacks.  
**World Plaques:** canvas-rendered Manrope with Arial fallback, requested at weight 500 (`src/world.js:25–29`).

Display titles use the frontmatter hierarchy; the title's second line receives Brass emphasis. Overlay headlines use balanced wrapping. Ending titles increase to `clamp(50px, 5.8vw, 83px)`. Ending prose is 18px at line-height 1.9. Captions use the caption role on a dark backing, with a 10px, letter-spaced Building label. Fine text is deliberately subordinate; world plaques resize text to fit their canvas rather than clipping it.

At the 700px breakpoint, the title becomes `clamp(64px, 16vw, 92px)`, captions become 14px, regular overlay headlines become 42px, and ending titles become 52px. This supports menu readability, not touch gameplay.

**Font-registration caveat.** The build embeds four TTF files. It declares Libre Caslon Display 400 and Manrope 600, but declares both `manrope400.ttf` and `manrope500.ttf` as Manrope 400 (`tools/build.mjs:9–13`). The source requests 500 for plaques; the shipped bundle does not explicitly register a 500 face. This documentation preserves that implementation fact rather than claiming exact weight fidelity.

## Layout

The world is a fixed full-viewport canvas, with a noninteractive vignette and a centered interaction ray. The title overlay is left-weighted: 8vh/7vw padding, a maximum 500px copy column, vertically stacked actions, and a dark-to-transparent horizontal veil leaving the astronomical mechanism visible on the right. The main title scene is the actual observatory with a slowly drifting camera (`src/main.js:22,72`).

Overlays use centered, scrollable panels rather than cards: normal width `min(440px, 100%)`, wide width `min(830px, 100%)`, maximum height 90vh. Settings split into two columns with a 45px gap. At widths up to 700px, settings become one column, outer overlay padding decreases from 32px to 16px, the menu is top-aligned with 13vh top padding, and the footer's trailing phrase is hidden.

During play, the room name, a traces counter that appears only once you have found something, and the Pause control occupy the top edge; the center contains only the crosshair and an opportunistic interaction cue; the dialogue panel is centered near the bottom, width `min(820px, calc(100% - 60px))`; small control tips sit below it. H hides the room label and tips, not dialogue or interaction cues.

### Implemented world and route architecture

| Space | Material / spatial identity | Routes and interactions |
|---|---|---|
| Your room | 14×14 office, desk, plant, clock, filing cabinets | Desk can end after three reads; door leads to the hub. |
| Department of Almost | 20×24 institutional lobby, benches, clock, brass floor marks | Approval, repeating corridor, customer-satisfaction button room, or return to office. |
| Office of Permission | 16×28 office with eight desks and a central stamp | Four stamps unlock the compliance ending; shredder leads directly to the archive; withdrawal returns to hub. |
| The smallest possible favor | 14×18 tiled room, pedestal button, shifting counter | Eight presses end; gallery exit and maintenance-to-garden route need no completed count. |
| A short corridor | 6-wide corridor, initially 40 long, increasing by 10 per repeat | Third passage reaches archive; side rejection also reaches archive; reconsideration returns to hub. |
| Archive of lives not lived | 26×32 suspended platform, instanced books, high clock, small orrery | Four cycling book excerpts; return policy note; observatory, quiet room, gallery, or hub. |
| The museum of you | 20×24 room, trophies, translucent empty display, objection button | Four objection presses end; routes to archive and hub. |
| The unwritten sky | 22×42 star platform, large orrery, measuring console, hidden author plaque | Garden or archive; author inscription ends the route. |
| Somewhere unmeasured | 32×42 platform, recursively generated tree, bench, sea, sun, distant columns | Bench ends in wonder; departure ends without a receipt; return to observatory. |
| A room without a task | 12×16 room, seat, illuminated window, plant | Eighteen uninterrupted seated seconds end in stillness; movement stands up; exit returns to archive. |
| Records of Nearly | 18×26 office of filing cabinets, your open file, a shelf of relics, an unfinished form | Read your own file twice to learn you are the second Sadman; the shelf yields two relics; the form can end the route as a confrontation. |
| A room of you | 22×26 dark platform, three standing glass versions under a mirror plane | Complied / refused / never-came; choosing one sets the run's alignment and records the photograph trace; leads to the water. |
| The stairs that arrive | 14×20 tall stairwell, a flight you cannot climb, two directions | UP speaks no destination; DOWN exits the story entirely as the refusal ending; a side door to the workshop opens at two traces. |
| Where the Building is mended | 24×28 open panels, hanging wiring, the repairman's chair | Repairing the Building counts as mercy and unlocks merging; the main panel hides the second handprint and the workshop trace. |
| The floor that remembers | 18×24 flooded room, waist-high water, floating relics | A recording under the water gives the recording trace and three listenings; the workshop is reachable from here once gated. |
| Above the Building | 30×34 flat roof, parapets, a night sky, two carved names | The scale reveal, the roof trace held in the older name, the successor ending, and the door back down for the first Sadman. |

These are separately rebuilt scenes connected by interaction portals, not one continuous loaded level. There are 74 scene-specific target instances across sixteen spaces; every one was verified reachable by a real camera ray from a collision-valid standing position, without tunnelling through geometry. Two spaces are gated rather than locked: the workshop opens at two discovered traces and the roof at three, and a premature attempt returns an authored in-world refusal instead of a dead end. The quiet room has no direct garden portal.

## Elevation & Depth

UI depth comes mostly from translucent dark planes over the real scene, not raised cards. The menu uses a linear veil and the canvas has a radial vignette. The crosshair has a small `0 1px 3px #132e2d` shadow; room labels and tips use text shadows for legibility. Dialogue, cues, and toasts use backing surfaces and thin rules.

World depth comes from standard rough materials, ambient environment lighting, a hemisphere light, a directional warm shadow light, small point lamps, fog, star points, and scale shifts between desks and monumental mechanisms (`src/world.js:19,41,60,67–81`). The renderer uses sRGB output, ACES Filmic tone mapping at exposure 1.04, a 68° field of view, and a 0.08–600 camera range (`src/main.js:20–22`).

High detail enables 1024² directional shadows and caps pixel ratio at 1.5. Low detail disables shadows and uses pixel ratio 1. Automatic detail can step down when measured frame rate falls below 27 after the initial frame period. This is a fallback, not evidence of any guaranteed frame rate. Scene replacement disposes owned geometry/materials/textures while retaining shared primitive geometry and the environment texture.

## Shapes

Buttons, overlay panels, subtitles, plaques, and portal frames are rectangular. No rounded-card system is implemented. The crosshair is the small circular UI exception. Circular forms in the world have narrative purpose: clocks, button caps, orrery rings, stars, and ocean rings.

World surfaces are locally generated 256×256 CanvasTextures for wood, carpet, and tile. Plaques use 1024px-wide canvas textures with text sized to fit. Geometry is authored with boxes, cylinders, low-poly spheres, toruses, beams, instanced books/leaves, and point clouds. These generated rasters are game assets, not stock images or generated promotional plates.

## Components

### Actions and controls

Buttons have a 44px base minimum height, 11px/20px padding, a 1px rule border, and 180ms background/border/transform feedback. Pressing translates the button down 1px. Primary buttons invert Paper/Ink and use weight 600. Title secondary actions are transparent, borderless, and have a 36px minimum height; the small in-play Pause control has a 34px minimum height. Focus-visible uses a 2px brass outline offset 4px. Native range, checkbox, and select controls retain labeled affordances; there is no custom input-component library.

### Dialogue, transcript, and discoveries

The caption surface announces changes politely, labels the speaker as THE BUILDING, and hides after a text-length-based interval. Pause provides a text transcript of up to 120 recent entries. New runs reset that transcript. Ending overlays present a title, full ending prose, a short afterword, the number discovered, and honest replay/title actions. The collection lists only discovered endings, with an explicit empty state rather than twelve spoilers.

### Traces and the dossier

The expanded arc is assembled from five authored traces (`file`, `photograph`, `recording`, `handprint`, `name`), each recorded only by its own source action in `src/rules.js` and never by proximity or time. The HUD grows a `traces n / 5` counter only after the first discovery, and Pause gains a **What you have found** control that opens a dossier listing only the traces actually collected, with an honest empty state and named-but-sealed hints for the gated spaces. The dossier replaces the pause panel and closing it returns there, so clue reading never drops the player into gameplay. Nothing about the arc is spoilered on the title screen: endings are still named only once discovered.

**Save honesty.** Progress lives in the browser's own `localStorage` under one game key. A player can edit it, exactly as with any single-player save file, and this document claims no tamper resistance: `safeSave` and the restore path filter to known ending, room and trace identifiers and clamp every counter, which prevents unknown endings, unknown rooms, crashes and absurd values, but it cannot stop someone from granting themselves a clue in their own save. Two recorded fields, `tree` and `authorFound`, are persisted but branch no logic; they are named here so they are not mistaken for hidden depth.

### Portals and interaction cues

A portal combines brass rectangular rails, a dark panel, restrained emissive edges, a label, and an E · OPEN plaque. Actual targeting requires a camera ray within 3.65 world units and an unobstructed line of sight. The cue names the available action; E or a world click invokes it. Normal movement is manual WASD with Shift acceleration, mouse look, or drag/arrow fallbacks. There are no touch movement controls.

### Motion and sound

Room travel uses a 220ms fade and a 230ms rebuild delay. The orrery rotates and gently floats; the tree sways by a small angle and garden dust rotates slowly. The in-game reduced-camera-motion preference removes walking bob only; it does not freeze the world or title camera. The OS reduced-motion media query removes the small DOM transitions for buttons, fades, captions, and toasts.

The Web Audio soundscape is synthesized locally: two room-specific drone tones, filtered noise, steps, interaction ticks, transition tones, and sparse notes in quieter spaces. Optional browser speech selects only installed local English voices and can be disabled separately from full mute. No recorded actor performance or cloud narration is bundled.

## Do's and Don'ts

### Do:
- **Do** preserve the named protagonist, original writing, and the analog-planetarium material vocabulary.
- **Do** keep the game manual by default and retain visible captions with an honest pause/transcript route.
- **Do** preserve the finite counts and exits: four approval stamps, eight button presses, three corridor traversals, four gallery objections, and reversible stillness.
- **Do** keep every clue traceable to an authored object and every gated space explained in-world; a gate must refuse with a sentence, never with silence.
- **Do** treat the HTML as the offline production artifact and keep asset provenance beside the source.
- **Do** use this document descriptively; the source and matching built bytes remain the implementation truth.

### Don't:
- **Don't** copy Stanley Parable dialogue, maps, recordings, or character/actor identities.
- **Don't** turn fictional hostility into deceptive settings, blocked leaving, grading, or an endless task.
- **Don't** document mobile menu fit as mobile gameplay, or reachability vantages as a complete human walkthrough.
- **Don't** infer pixel-perfect appearance or complete accessibility from the regex detector or the small local visual model.
- **Don't** introduce remote runtime resources or upload evidence images.
- **Don't** claim the local save is tamper-proof, or present recorded flags as gameplay depth.

**Provenance.** Three.js 0.180.0 is MIT; Libre Caslon Display and Manrope are SIL OFL. Original license texts are in `licenses/`; font source URLs are retained in `public/fonts/source.css` and are not runtime requests. `THIRD-PARTY-NOTICES.md` identifies procedural content and local Chrome captures. The machine-readable companion is `.impeccable/design.json`, using schemaVersion 2: frontmatter owns primitives, while the sidecar carries extension metadata, motion, depth, breakpoints, self-contained component samples, and the assigned-world narrative. It is documentation, not a game runtime dependency. See `qa/review.json` for disposition, exact evidence, and limitations.
