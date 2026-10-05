# Sadman's Parable v1.0.1

Documentation and notice release. **The game itself is unchanged** — same 16 spaces, 12 endings, and 162 passing assertions.

## Added: a prominent non-affiliation notice

Sadman's Parable is an original work and an **unaffiliated homage**. It is not affiliated with, endorsed by, sponsored by, or approved by Crows Crows Crows, Galactic Cafe, or the creators of *The Stanley Parable*.

The notice now appears in three places:

- **On the title screen**, directly under the premise.
- **In Controls & settings**, with the full statement: no dialogue, art, level layout, character, music or voice recording from that game is contained, and the optional narration uses an installed operating-system voice rather than any actor's performance.
- **At the top of the README.**

## Why

The title borrows the `[Name]'s Parable` frame, and *The Stanley Parable* is an actively sold franchise. Titles aren't protected by copyright, but they can implicate trademark, and that was the single point of exposure in an otherwise asset-original game. Everything else is defensible: a verified sweep of the shipped build finds zero occurrences of "Stanley", "Mind Control", "Bucket", "Brighting", "Wreden", "Crows", "Galactic", "Ultra Deluxe", "Broom Closet" or "two doors"; the narrator is labelled `THE BUILDING`, never "The Narrator"; and the art and audio share no look or feel with the original.

This release removes ambiguity without changing the game.

## Verified in this build

- 33 gameplay-reducer tests, 0 failures, 0 skips
- 55 live browser checks in a real Chrome, 0 game errors — including two new checks that assert the non-affiliation notice is present and visible on the title screen and in the settings panel
- 74 of 74 in-world interaction targets reachable by a real camera ray across 16 rooms
- All 12 endings reached; all 16 rooms render
- Standalone file with networking forced offline: 0 external requests, manual control by default
- `Sadman's Parable.html` — 1,103,468 bytes, SHA-256 `adbd1ecbe9bb53df44ec8e5dd69f7d5000e334b2fb733ec0987b29285027e91a`

## Limitations

Automated coverage, not a complete human playthrough. No claim of locked framerate, WCAG conformance, or pixel-level art review. This is a notice change, not legal advice; a rights-holder who would like something changed should open an issue on the repository.
