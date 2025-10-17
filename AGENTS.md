# AGENTS.md

## Project Setup
Vanilla JavaScript project (no build system). Open `index.html` in a browser to run.

## Code Style Guidelines

### JavaScript
- **Classes**: Use PascalCase (e.g., `TemporalEngine`, `ColorSystem`), with methods in camelCase
- **Constants**: UPPER_SNAKE_CASE for global constants
- **Functions**: camelCase; keep pure where possible
- **Naming**: Descriptive names; abbreviate only when obvious (e.g., `ctx` for canvas context)
- **Error handling**: Try-catch for timezone detection; fallback gracefully to UTC
- **Comments**: Inline comments for complex calculations; no block comments

### CSS
- **BEM-inspired**: Class names like `.ring-label`, `.control-btn`, `.day-view` (state prefix)
- **Organization**: Group related selectors; use media queries at end
- **Animations**: Define `@keyframes` with descriptive names; use `ease-in-out` for smooth transitions
- **Colors**: Use LUFS palette (`#78BEBA` teal, `#2069af` blue, `#E7B225` yellow) or HSL for dynamic colors

### HTML
- **Semantic**: Use `<canvas>`, `<button>` with data attributes for functionality
- **IDs**: Used for JS targeting (e.g., `timeCanvas`, `yearViewBtn`)
- **Accessibility**: Descriptive alt text, proper heading hierarchy

## Architecture Patterns
- **Engine pattern**: Separate concerns into classes (TemporalEngine, ColorSystem, AnimationController, RenderingEngine)
- **Global instances**: Create singletons after DOM load; expose to `window` when needed
- **Canvas rendering**: Use `requestAnimationFrame` for smooth animation loop
- **State management**: Store view mode, scale, rotation in AnimationController; update via methods

## Imports & Dependencies
- No external dependencies; uses vanilla JS and Canvas 2D API
- Browser APIs: `Date`, `Intl`, `performance`, `requestAnimationFrame`

## Common Tasks
- **Fix visual bugs**: Check RenderingEngine's `drawTemporalRing()` and ring radius calculations
- **Add ring types**: Update `initializeRings()`, `spectralMap`, and `ringLabels` in parallel
- **Adjust colors**: Modify ColorSystem's `lufsColors` or `spectralMap` hues
- **Change animation timing**: Adjust `transitionDuration` in AnimationController or animation speeds in CSS
