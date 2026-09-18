const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', '..', 'data', 'scores.db');

const fs = require('fs');
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player TEXT NOT NULL,
    score INTEGER NOT NULL CHECK(score >= 0 AND score <= 1000),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

db.exec(`
  CREATE INDEX IF NOT EXISTS idx_scores_score ON scores(score DESC)
`);

const insertScore = db.prepare(
  'INSERT INTO scores (player, score) VALUES (@player, @score)'
);

const getTopScores = db.prepare(
  'SELECT player, score FROM scores ORDER BY score DESC, created_at ASC LIMIT 50'
);

function addScore(player, score) {
  return insertScore.run({ player, score });
}

function listScores() {
  return getTopScores.all();
}

module.exports = { addScore, listScores };
