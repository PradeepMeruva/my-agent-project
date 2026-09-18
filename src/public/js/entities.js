var DriftEntities = (function () {
  var OBSTACLE_SHAPES = ['triangle', 'diamond', 'hexagon', 'circle'];
  var OBSTACLE_COLORS = [
    { fill: 'rgba(255, 100, 60, 0.15)', stroke: '#ff6040' },
    { fill: 'rgba(255, 170, 50, 0.15)', stroke: '#ffaa30' },
    { fill: 'rgba(255, 60, 160, 0.15)', stroke: '#ff40a0' },
    { fill: 'rgba(180, 80, 255, 0.15)', stroke: '#b050ff' },
  ];

  function createPlayer(canvasW, canvasH) {
    return {
      x: canvasW * 0.15,
      y: canvasH * 0.5,
      radius: 6,
      trail: [],
      maxTrailLength: 20,
    };
  }

  function createObstacle(canvasW, canvasH, speed, elapsed) {
    var shapeIdx = Math.floor(Math.random() * OBSTACLE_SHAPES.length);
    var colorIdx = Math.floor(Math.random() * OBSTACLE_COLORS.length);
    var baseSize = 18 + Math.random() * 28;
    var difficultyScale = Math.min(1.5, 1 + elapsed / 120);
    var size = baseSize * difficultyScale;

    var margin = size + 20;
    var y = margin + Math.random() * (canvasH - margin * 2);

    return {
      x: canvasW + size,
      y: y,
      size: size,
      shape: OBSTACLE_SHAPES[shapeIdx],
      color: OBSTACLE_COLORS[colorIdx],
      speed: speed,
      grazed: false,
      hitRadius: size * 0.7,
      grazeRadius: size * 1.6,
    };
  }

  function createStar(canvasW, canvasH) {
    return {
      x: Math.random() * canvasW,
      y: Math.random() * canvasH,
      size: 0.5 + Math.random() * 1.5,
      brightness: 0.2 + Math.random() * 0.6,
      speed: 0.2 + Math.random() * 0.8,
    };
  }

  function createGrazeParticle(x, y, color) {
    var angle = Math.random() * Math.PI * 2;
    var speed = 1 + Math.random() * 3;
    return {
      x: x,
      y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1.0,
      decay: 0.02 + Math.random() * 0.03,
      size: 1 + Math.random() * 2,
      color: color,
    };
  }

  return {
    createPlayer: createPlayer,
    createObstacle: createObstacle,
    createStar: createStar,
    createGrazeParticle: createGrazeParticle,
  };
})();
