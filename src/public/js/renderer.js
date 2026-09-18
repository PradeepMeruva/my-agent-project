var DriftRenderer = (function () {
  var canvas, ctx;

  function init(canvasEl) {
    canvas = canvasEl;
    ctx = canvas.getContext('2d');
    resize();
    return { canvas: canvas, ctx: ctx };
  }

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function clear() {
    ctx.fillStyle = '#050510';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  function drawStars(stars) {
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      ctx.globalAlpha = s.brightness;
      ctx.fillStyle = '#aaccff';
      ctx.fillRect(s.x, s.y, s.size, s.size);
    }
    ctx.globalAlpha = 1;
  }

  function drawPlayer(player) {
    for (var i = 0; i < player.trail.length; i++) {
      var t = player.trail[i];
      var alpha = (i / player.trail.length) * 0.5;
      var size = player.radius * (0.3 + 0.7 * (i / player.trail.length));
      ctx.beginPath();
      ctx.arc(t.x, t.y, size, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 255, 255, ' + alpha + ')';
      ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#0ff';
    ctx.shadowColor = '#0ff';
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius * 0.4, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
  }

  function drawObstacle(obs) {
    ctx.save();
    ctx.translate(obs.x, obs.y);

    ctx.fillStyle = obs.color.fill;
    ctx.strokeStyle = obs.color.stroke;
    ctx.lineWidth = 1.5;
    ctx.shadowColor = obs.color.stroke;
    ctx.shadowBlur = obs.grazed ? 20 : 8;

    ctx.beginPath();
    switch (obs.shape) {
      case 'triangle':
        drawTriangle(obs.size);
        break;
      case 'diamond':
        drawDiamond(obs.size);
        break;
      case 'hexagon':
        drawHexagon(obs.size);
        break;
      case 'circle':
        ctx.arc(0, 0, obs.size * 0.6, 0, Math.PI * 2);
        break;
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  function drawTriangle(size) {
    var h = size * 0.866;
    ctx.moveTo(0, -h * 0.66);
    ctx.lineTo(-size * 0.5, h * 0.33);
    ctx.lineTo(size * 0.5, h * 0.33);
  }

  function drawDiamond(size) {
    ctx.moveTo(0, -size * 0.6);
    ctx.lineTo(size * 0.4, 0);
    ctx.lineTo(0, size * 0.6);
    ctx.lineTo(-size * 0.4, 0);
  }

  function drawHexagon(size) {
    var r = size * 0.5;
    for (var i = 0; i < 6; i++) {
      var angle = (Math.PI / 3) * i - Math.PI / 6;
      var px = Math.cos(angle) * r;
      var py = Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
  }

  function drawParticles(particles) {
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }
    ctx.globalAlpha = 1;
  }

  function drawSpeedLines(speed, canvasH) {
    if (speed < 3) return;
    var intensity = Math.min(1, (speed - 3) / 6);
    ctx.strokeStyle = 'rgba(100, 180, 255, ' + (intensity * 0.15) + ')';
    ctx.lineWidth = 1;
    for (var i = 0; i < 8; i++) {
      var y = Math.random() * canvasH;
      var len = 30 + Math.random() * 60 * intensity;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(len, y);
      ctx.stroke();
    }
  }

  function getWidth() { return canvas.width; }
  function getHeight() { return canvas.height; }

  return {
    init: init,
    resize: resize,
    clear: clear,
    drawStars: drawStars,
    drawPlayer: drawPlayer,
    drawObstacle: drawObstacle,
    drawParticles: drawParticles,
    drawSpeedLines: drawSpeedLines,
    getWidth: getWidth,
    getHeight: getHeight,
  };
})();
