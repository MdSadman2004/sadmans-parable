# Third-party notices and asset provenance

## Runtime

- **Three.js 0.180.0** — https://github.com/mrdoob/three.js — MIT license, included in `licenses/Three-MIT.txt`. Bundled into the offline HTML; no runtime download.
- **Libre Caslon Display** — https://fonts.google.com/specimen/Libre+Caslon+Display — SIL Open Font License, included in `licenses/Libre-Caslon-Display-OFL.txt`. Downloaded from the Google Fonts distribution and embedded into the HTML.
- **Manrope** — https://fonts.google.com/specimen/Manrope — SIL Open Font License, included in `licenses/Manrope-OFL.txt`. Downloaded from the Google Fonts distribution and embedded into the HTML.

The font source URLs are retained in `public/fonts/source.css`; this source record is not loaded by the game.

## Original content

The dialogue, endings, geometry, procedural materials, environment layout, and Web Audio soundscape were authored specifically for Sadman's Parable. Procedural raster textures are generated locally by `src/world.js` from seeded algorithms; they are not stock photographs or diffusion-generated assets.

The Stanley Parable is an inspiration for narrative structure only. Its name and developer/actor identities are not represented as affiliated with this game. No content from it is bundled.

## Evidence images

PNG files under `qa/` are actual Chrome WebGL/DOM captures of this game's local build. They are verification evidence, not generated promotional renders. JPEG images with `-vision` are downscaled derivatives used by a local CPU vision model; no screenshots were uploaded to an external vision service.

## Development-only dependencies

Esbuild bundles the game; Playwright-core was investigated for local testing, but broad CDP attachment timed out. The retained production QA scripts use target-specific Chrome DevTools Protocol instead. Neither development package is a required runtime installation.
