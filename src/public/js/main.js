(function () {
  var canvas = document.getElementById('game-canvas');
  DriftRenderer.init(canvas);
  DriftUI.init();
  DriftEngine.bindInput();

  window.addEventListener('resize', function () {
    DriftRenderer.resize();
  });

  DriftUI.onStart(function () {
    DriftEngine.start();
  });

  DriftUI.onRetry(function () {
    DriftEngine.start();
  });

  DriftUI.onSubmit(function () {
    return { score: DriftEngine.getLastScore() };
  });

  DriftUI.showMenu();
})();
