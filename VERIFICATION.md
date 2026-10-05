# Verification

Built standalone game: 1102702 bytes. SHA-256: `7f7f1fff59327cb0e938b8a3d8d0a4e82554005b87fdf9138229bdab6b02e56f`.

- Gameplay reducer: 33 passed, 0 failed, 0 skipped.
- Authorized Chrome runtime: 53 passed, 0 failed; 16 rooms rendered; 12 distinct endings reached; 0 captured game errors.
- Actual scene geometry: 74 of 74 interaction targets reachable from a collision-valid standing position with a real camera ray.
- Standalone file with browser networking forced offline: true; external requests 0; manual default true; QA shortcuts disabled true.
- Real W, D, Escape, and E input checked, including physical door and button raycasts. Settings were changed and independently read from local storage; QA settings/discoveries were restored afterward.
- Scene replacement resource test: office returned to the same texture and geometry counts after repeated room cycles.

## Scope and limitations

All-ending coverage uses explicitly enabled QA relocation/actions, not a complete manual playthrough. No long-duration stability or locked 60-fps claim is made. Short headless samples vary with scene complexity and existing browser activity. Mouse capture has an honest drag/arrow fallback and must be granted by the player in the visible window. Narration uses installed local English voices; no studio voice performance is claimed.

Actual WebGL/DOM screenshots are in qa/. Broad visual readback used a local SmolVLM2 CPU model, which can misread fine text; exact labels and state are checked in the DOM instead. The mechanical design detector ran in degraded regex mode because parser modules are not installed; its empty findings are not a computed contrast audit.

Runtime and offline reports: qa/runtime-results.json and qa/offline-results.json. Individual reachability checks: qa/reachability.json. Source/artifact hashes: qa/source-manifest.json.
