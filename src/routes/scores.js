const { Router } = require('express');
const { addScore, listScores } = require('../db');
const { validateScoreInput } = require('../validation/scores');

const router = Router();

router.get('/', (req, res) => {
  const scores = listScores();
  res.json(scores);
});

router.post('/', (req, res) => {
  const { valid, errors, sanitized } = validateScoreInput(req.body);

  if (!valid) {
    return res.status(400).json({ error: errors.join('; ') });
  }

  try {
    addScore(sanitized.player, sanitized.score);
    res.status(201).json({ player: sanitized.player, score: sanitized.score });
  } catch (err) {
    console.error('Failed to save score:', err);
    res.status(500).json({ error: 'Failed to save score' });
  }
});

module.exports = router;
