var DriftAPI = (function () {
  var basePath = 'api/scores';

  function resolveURL() {
    return basePath;
  }

  function fetchScores(callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', resolveURL());
    xhr.setRequestHeader('Accept', 'application/json');
    xhr.onload = function () {
      if (xhr.status === 200) {
        try {
          callback(null, JSON.parse(xhr.responseText));
        } catch (e) {
          callback(new Error('Invalid response'));
        }
      } else {
        callback(new Error('HTTP ' + xhr.status));
      }
    };
    xhr.onerror = function () {
      callback(new Error('Network error'));
    };
    xhr.send();
  }

  function submitScore(player, score, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', resolveURL());
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function () {
      if (xhr.status === 201) {
        try {
          callback(null, JSON.parse(xhr.responseText));
        } catch (e) {
          callback(new Error('Invalid response'));
        }
      } else {
        try {
          var body = JSON.parse(xhr.responseText);
          callback(new Error(body.error || 'HTTP ' + xhr.status));
        } catch (e) {
          callback(new Error('HTTP ' + xhr.status));
        }
      }
    };
    xhr.onerror = function () {
      callback(new Error('Network error'));
    };
    xhr.send(JSON.stringify({ player: player, score: score }));
  }

  return {
    fetchScores: fetchScores,
    submitScore: submitScore,
  };
})();
