var DriftUI = (function () {
  var els = {};
  var submitting = false;
  var submitted = false;

  function init() {
    els.overlay = document.getElementById('overlay');
    els.menuScreen = document.getElementById('menu-screen');
    els.gameoverScreen = document.getElementById('gameover-screen');
    els.btnStart = document.getElementById('btn-start');
    els.btnSubmit = document.getElementById('btn-submit');
    els.btnRetry = document.getElementById('btn-retry');
    els.playerName = document.getElementById('player-name');
    els.submitStatus = document.getElementById('submit-status');
    els.hudTime = document.getElementById('hud-time');
    els.hudScore = document.getElementById('hud-score');
    els.hudGraze = document.getElementById('hud-graze');
    els.statTime = document.getElementById('stat-time');
    els.statGraze = document.getElementById('stat-graze');
    els.statTotal = document.getElementById('stat-total');
    els.scoresList = document.getElementById('scores-list');
    els.scoresPanel = document.getElementById('scores-panel');
  }

  function showMenu() {
    els.overlay.classList.add('active');
    els.menuScreen.classList.add('active');
    els.menuScreen.classList.remove('hidden');
    els.gameoverScreen.classList.add('hidden');
    els.gameoverScreen.classList.remove('active');
    els.scoresPanel.style.display = '';
    refreshScores();
  }

  function hideOverlay() {
    els.overlay.classList.remove('active');
  }

  function showGameOver(secondsSurvived, grazeTotal, workshopScore) {
    submitted = false;
    submitting = false;
    els.overlay.classList.add('active');
    els.menuScreen.classList.add('hidden');
    els.menuScreen.classList.remove('active');
    els.gameoverScreen.classList.add('active');
    els.gameoverScreen.classList.remove('hidden');

    els.statTime.textContent = formatTime(secondsSurvived);
    els.statGraze.textContent = '+' + Math.min(DriftScoring.MAX_GRAZE_SCORE, Math.floor(grazeTotal));
    els.statTotal.textContent = workshopScore;

    els.playerName.value = '';
    els.playerName.disabled = false;
    els.btnSubmit.disabled = false;
    els.btnSubmit.textContent = 'SAVE SCORE';
    els.submitStatus.className = 'hidden';
    els.submitStatus.textContent = '';
    els.scoresPanel.style.display = '';

    refreshScores();

    setTimeout(function () { els.playerName.focus(); }, 100);
  }

  function formatTime(seconds) {
    var m = Math.floor(seconds / 60);
    var s = Math.floor(seconds % 60);
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  function updateHUD(secondsSurvived, workshopScore) {
    els.hudTime.textContent = formatTime(secondsSurvived);
    els.hudScore.textContent = workshopScore;
  }

  function flashGraze() {
    els.hudGraze.classList.remove('hidden');
    clearTimeout(els.hudGraze._timer);
    els.hudGraze._timer = setTimeout(function () {
      els.hudGraze.classList.add('hidden');
    }, 400);
  }

  function onStart(callback) {
    els.btnStart.addEventListener('click', function () {
      callback();
    });
  }

  function onRetry(callback) {
    els.btnRetry.addEventListener('click', function () {
      callback();
    });
  }

  function onSubmit(getScoreData) {
    function doSubmit() {
      if (submitting || submitted) return;

      var name = els.playerName.value.trim();
      if (!name) {
        els.submitStatus.className = 'error';
        els.submitStatus.textContent = 'Enter your name first';
        return;
      }

      var data = getScoreData();
      submitting = true;
      els.btnSubmit.disabled = true;
      els.btnSubmit.textContent = 'SAVING...';
      els.submitStatus.className = 'hidden';

      DriftAPI.submitScore(name, data.score, function (err) {
        submitting = false;
        if (err) {
          els.btnSubmit.disabled = false;
          els.btnSubmit.textContent = 'SAVE SCORE';
          els.submitStatus.className = 'error';
          els.submitStatus.textContent = err.message;
        } else {
          submitted = true;
          els.btnSubmit.textContent = 'SAVED';
          els.playerName.disabled = true;
          els.submitStatus.className = 'success';
          els.submitStatus.textContent = 'Score saved!';
          refreshScores();
        }
      });
    }

    els.btnSubmit.addEventListener('click', doSubmit);

    els.playerName.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        doSubmit();
      }
    });
  }

  function refreshScores() {
    DriftAPI.fetchScores(function (err, scores) {
      if (err || !Array.isArray(scores)) return;
      els.scoresList.innerHTML = '';
      scores.forEach(function (entry) {
        var li = document.createElement('li');
        var nameSpan = document.createElement('span');
        nameSpan.className = 'score-player';
        nameSpan.textContent = entry.player;
        var scoreSpan = document.createElement('span');
        scoreSpan.className = 'score-value';
        scoreSpan.textContent = entry.score;
        li.appendChild(nameSpan);
        li.appendChild(scoreSpan);
        els.scoresList.appendChild(li);
      });
    });
  }

  return {
    init: init,
    showMenu: showMenu,
    hideOverlay: hideOverlay,
    showGameOver: showGameOver,
    updateHUD: updateHUD,
    flashGraze: flashGraze,
    onStart: onStart,
    onRetry: onRetry,
    onSubmit: onSubmit,
    refreshScores: refreshScores,
  };
})();
