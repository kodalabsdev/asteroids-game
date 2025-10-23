const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database setup
const db = new sqlite3.Database('./scores.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
    // Create scores table if it doesn't exist
    db.run(`CREATE TABLE IF NOT EXISTS scores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_name TEXT NOT NULL,
      score INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
      if (err) {
        console.error('Error creating table:', err.message);
      } else {
        console.log('Scores table ready.');
      }
    });
  }
});

// API Routes

// Get all high scores
app.get('/api/scores', (req, res) => {
  db.all('SELECT * FROM scores ORDER BY score DESC LIMIT 10', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ scores: rows });
  });
});

// Save a new score
app.post('/api/scores', (req, res) => {
  const { playerName, score } = req.body;

  if (!playerName || typeof score !== 'number') {
    return res.status(400).json({ error: 'Invalid player name or score' });
  }

  const sql = 'INSERT INTO scores (player_name, score) VALUES (?, ?)';
  const params = [playerName, score];

  db.run(sql, params, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({
      id: this.lastID,
      message: 'Score saved successfully'
    });
  });
});

// Get top scores
app.get('/api/scores/top', (req, res) => {
  const limit = parseInt(req.query.limit) || 10;

  db.all('SELECT player_name, score, created_at FROM scores ORDER BY score DESC LIMIT ?',
    [limit], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ topScores: rows });
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Asteroids backend is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Asteroids backend server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('Database connection closed.');
    }
    process.exit(0);
  });
});