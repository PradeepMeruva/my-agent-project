const { Router } = require('express');

const router = Router();

router.get('/', (req, res) => {
  res.json({ status: 'ok', workshop: 'coding-agents' });
});

module.exports = router;
