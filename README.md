# Drift

A cosmic avoidance game with grazing mechanics and persistent high scores.

## Concept

You pilot a glowing particle through an endless field of geometric obstacles
scrolling from right to left. The particle always advances; you control its
vertical position. Speed increases over time. A round lasts up to 90 seconds
or until you collide.

The core mechanic is **grazing**: passing dangerously close to obstacles without
touching them earns bonus points and triggers a visual reward. This creates a
risk/reward tension — safe play earns a modest time-based score, but high scores
require threading close to every obstacle.

## Visual Identity

Neon wireframe on deep space. The player is a bright cyan orb with a comet
trail. Obstacles are warm-colored geometric shapes (triangles, diamonds,
hexagons, circles) with glowing edges. Grazes produce particle bursts in the
obstacle's color. Background stars parallax-scroll for depth.

## Controls

- **Mouse**: move the cursor vertically to steer the particle (smooth interpolation)
- **Arrow keys / W / S**: alternative keyboard steering
- **Click START** or the start button to begin a round
- After the round, type your name and press Enter or click SAVE SCORE

## Score System (0–1000)

Workshop scores are integers from 0 to 1000, higher is better.

Two components:

| Component | Range | How it's earned |
|-----------|-------|-----------------|
| Time      | 0–600 | `floor((seconds_survived / 90) × 600)` — surviving the full 90-second round yields 600 |
| Graze     | 0–400 | Accumulated from close passes. Each graze: 8–20 points based on proximity (closer = more, riskier). Capped at 400. |

**Total** = min(1000, time + graze)

**What 1000 means**: surviving most or all of the 90-second round while
consistently threading close to obstacles. It requires both the patience to
survive increasing speed and the boldness to graze every opportunity. A cautious
full-survival run yields ~600; reaching 1000 demands sustained risk-taking.

The same integer workshop score is displayed in the HUD during play, shown on
the game-over screen, saved to the database, and returned by the API.

## API

- `GET /api/scores` — returns a JSON array of `{ player, score }` objects, best first (up to 50)
- `POST /api/scores` — saves a score. Body: `{ "player": "name", "score": 750 }`.
  Validates: player required (1–40 chars), score required (integer 0–1000).
  Returns 201 on success, 400 with `{ error }` on bad input.

Scores persist in SQLite (`data/scores.db`), surviving restarts.

## Running

```bash
npm install --omit=dev
npm start
```

The server listens on the port set by the `PORT` environment variable,
defaulting to 3000. It binds to 127.0.0.1.

```bash
PORT=8080 npm start
```

Open `http://127.0.0.1:3000` (or your chosen port) in a browser to play.

## Project Structure

```
src/
  server.js              Entry point — starts Express on PORT
  app.js                 Express app: middleware, static serving, routes
  routes/scores.js       GET/POST /api/scores handlers
  db/index.js            SQLite setup, prepared statements, queries
  validation/scores.js   Input validation for score submissions
  public/                Static assets served to the browser
    index.html           Game page
    css/style.css        Game styling
    js/
      main.js            Initializes game, binds events
      engine.js          Game loop, state, physics, collision
      renderer.js        Canvas rendering (player, obstacles, effects)
      entities.js        Entity factories (player, obstacles, stars, particles)
      scoring.js         Score calculation (time + graze → workshop score)
      api.js             XHR client for the score API
      ui.js              Overlay/HUD management, name entry, leaderboard
```
