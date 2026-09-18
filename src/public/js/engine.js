var DriftEngine = (function () {
  var state = null;
  var input = { mouseY: null, keys: {} };
  var animFrame = null;

  var BASE_SPEED = 2;
  var MAX_SPEED = 8;
  var SPAWN_INTERVAL_BASE = 1.2;
  var SPAWN_INTERVAL_MIN = 0.35;
  var STAR_COUNT = 120;
  var PLAYER_MOVE_SPEED = 5;
  var PLAYER_LERP = 0.08;

  function createState() {
    var w = DriftRenderer.getWidth();
    var h = DriftRenderer.getHeight();
    var stars = [];
    for (var i = 0; i < STAR_COUNT; i++) {
      stars.push(DriftEntities.createStar(w, h));
    }
    return {
      player: DriftEntities.createPlayer(w, h),
      obstacles: [],
      particles: [],
      stars: stars,
      elapsed: 0,
      grazeTotal: 0,
      alive: true,
      lastSpawn: 0,
      lastTimestamp: null,
    };
  }

  function start() {
    state = createState();
    DriftUI.hideOverlay();
    if (animFrame) cancelAnimationFrame(animFrame);
    state.lastTimestamp = performance.now();
    animFrame = requestAnimationFrame(tick);
  }

  function tick(timestamp) {
    if (!state || !state.alive) return;

    var dt = (timestamp - state.lastTimestamp) / 1000;
    dt = Math.min(dt, 0.1);
    state.lastTimestamp = timestamp;
    state.elapsed += dt;

    if (state.elapsed >= DriftScoring.ROUND_DURATION_S) {
      endRound();
      return;
    }

    update(dt);
    render();

    var ws = DriftScoring.computeWorkshopScore(state.elapsed, state.grazeTotal);
    DriftUI.updateHUD(state.elapsed, ws);

    animFrame = requestAnimationFrame(tick);
  }

  function update(dt) {
    var w = DriftRenderer.getWidth();
    var h = DriftRenderer.getHeight();
    var progress = state.elapsed / DriftScoring.ROUND_DURATION_S;
    var speed = BASE_SPEED + (MAX_SPEED - BASE_SPEED) * progress;

    updatePlayer(dt, h);
    updateStars(dt, w, h, speed);
    spawnObstacles(w, h, speed);
    updateObstacles(dt, w, speed);
    updateParticles(dt);
    checkCollisions();
  }

  function updatePlayer(dt, canvasH) {
    var p = state.player;
    var targetY = p.y;

    if (input.mouseY !== null) {
      targetY = input.mouseY;
    }
    if (input.keys['ArrowUp'] || input.keys['w'] || input.keys['W']) {
      targetY = p.y - PLAYER_MOVE_SPEED * dt * 60;
    }
    if (input.keys['ArrowDown'] || input.keys['s'] || input.keys['S']) {
      targetY = p.y + PLAYER_MOVE_SPEED * dt * 60;
    }

    targetY = Math.max(p.radius, Math.min(canvasH - p.radius, targetY));
    p.y += (targetY - p.y) * PLAYER_LERP * dt * 60;

    p.trail.push({ x: p.x, y: p.y });
    if (p.trail.length > p.maxTrailLength) {
      p.trail.shift();
    }
  }

  function updateStars(dt, w, h, speed) {
    for (var i = 0; i < state.stars.length; i++) {
      var s = state.stars[i];
      s.x -= s.speed * speed * 0.3 * dt * 60;
      if (s.x < -2) {
        s.x = w + 2;
        s.y = Math.random() * h;
      }
    }
  }

  function spawnObstacles(w, h, speed) {
    var spawnInterval = Math.max(
      SPAWN_INTERVAL_MIN,
      SPAWN_INTERVAL_BASE - (state.elapsed / DriftScoring.ROUND_DURATION_S) * 0.7
    );

    if (state.elapsed - state.lastSpawn >= spawnInterval) {
      state.obstacles.push(DriftEntities.createObstacle(w, h, speed, state.elapsed));
      state.lastSpawn = state.elapsed;

      if (state.elapsed > 30 && Math.random() < 0.3) {
        state.obstacles.push(DriftEntities.createObstacle(w, h, speed, state.elapsed));
      }
      if (state.elapsed > 60 && Math.random() < 0.2) {
        state.obstacles.push(DriftEntities.createObstacle(w, h, speed, state.elapsed));
      }
    }
  }

  function updateObstacles(dt, w, speed) {
    for (var i = state.obstacles.length - 1; i >= 0; i--) {
      var obs = state.obstacles[i];
      obs.x -= speed * dt * 60;
      if (obs.x < -obs.size * 2) {
        state.obstacles.splice(i, 1);
      }
    }
  }

  function updateParticles(dt) {
    for (var i = state.particles.length - 1; i >= 0; i--) {
      var p = state.particles[i];
      p.x += p.vx * dt * 60;
      p.y += p.vy * dt * 60;
      p.life -= p.decay * dt * 60;
      if (p.life <= 0) {
        state.particles.splice(i, 1);
      }
    }
  }

  function checkCollisions() {
    var p = state.player;
    for (var i = 0; i < state.obstacles.length; i++) {
      var obs = state.obstacles[i];
      var dx = p.x - obs.x;
      var dy = p.y - obs.y;
      var dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < p.radius + obs.hitRadius) {
        state.alive = false;
        endRound();
        return;
      }

      if (!obs.grazed && dist < p.radius + obs.grazeRadius) {
        obs.grazed = true;
        var proximityRatio = 1 - (dist - p.radius - obs.hitRadius) /
          (obs.grazeRadius - obs.hitRadius);
        var points = DriftScoring.computeGrazePoints(proximityRatio);
        state.grazeTotal += points;

        for (var j = 0; j < 6; j++) {
          state.particles.push(
            DriftEntities.createGrazeParticle(
              (p.x + obs.x) / 2,
              (p.y + obs.y) / 2,
              obs.color.stroke
            )
          );
        }
        DriftUI.flashGraze();
      }
    }
  }

  function render() {
    DriftRenderer.clear();

    var progress = state.elapsed / DriftScoring.ROUND_DURATION_S;
    var speed = BASE_SPEED + (MAX_SPEED - BASE_SPEED) * progress;

    DriftRenderer.drawStars(state.stars);
    DriftRenderer.drawSpeedLines(speed, DriftRenderer.getHeight());

    for (var i = 0; i < state.obstacles.length; i++) {
      DriftRenderer.drawObstacle(state.obstacles[i]);
    }

    DriftRenderer.drawParticles(state.particles);
    DriftRenderer.drawPlayer(state.player);
  }

  function endRound() {
    if (animFrame) {
      cancelAnimationFrame(animFrame);
      animFrame = null;
    }

    var ws = DriftScoring.computeWorkshopScore(state.elapsed, state.grazeTotal);
    DriftUI.updateHUD(state.elapsed, ws);
    DriftUI.showGameOver(state.elapsed, state.grazeTotal, ws);
  }

  function getLastScore() {
    if (!state) return 0;
    return DriftScoring.computeWorkshopScore(state.elapsed, state.grazeTotal);
  }

  function handleMouseMove(e) {
    input.mouseY = e.clientY;
  }

  function handleKeyDown(e) {
    if (['ArrowUp', 'ArrowDown', 'w', 'W', 's', 'S'].indexOf(e.key) !== -1) {
      if (state && state.alive) {
        e.preventDefault();
      }
      input.keys[e.key] = true;
    }
  }

  function handleKeyUp(e) {
    input.keys[e.key] = false;
  }

  function bindInput() {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
  }

  return {
    start: start,
    getLastScore: getLastScore,
    bindInput: bindInput,
  };
})();
