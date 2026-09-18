function validateScoreInput(body) {
  const errors = [];

  if (body === null || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be a JSON object'] };
  }

  const { player, score } = body;

  if (player === undefined || player === null) {
    errors.push('player is required');
  } else if (typeof player !== 'string') {
    errors.push('player must be a string');
  } else if (player.trim().length === 0) {
    errors.push('player must not be empty');
  } else if (player.trim().length > 40) {
    errors.push('player must be 40 characters or fewer');
  }

  if (score === undefined || score === null) {
    errors.push('score is required');
  } else if (typeof score !== 'number' || !Number.isInteger(score)) {
    errors.push('score must be an integer');
  } else if (score < 0) {
    errors.push('score must be at least 0');
  } else if (score > 1000) {
    errors.push('score must be at most 1000');
  }

  return {
    valid: errors.length === 0,
    errors,
    sanitized: errors.length === 0
      ? { player: player.trim(), score }
      : null,
  };
}

module.exports = { validateScoreInput };
