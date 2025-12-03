const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /matches (liste de tous les matchs)
router.get('/', (req, res) => {
  db.all(
    `
    SELECT m.*, u.firstname || ' ' || u.lastname AS admin_name
    FROM matches m
    JOIN users u ON m.admin_id = u.id
    ORDER BY m.date, m.time
    `,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json(rows);
    }
  );
});

// POST /matches (création d'un match)
router.post('/', auth, (req, res) => {
  const { title, location, date, time, max_players, description } = req.body;

  if (!title || !location || !date || !time || !max_players) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const stmt = db.prepare(`
    INSERT INTO matches (admin_id, title, location, date, time, max_players, description)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    req.user.id,
    title,
    location,
    date,
    time,
    max_players,
    description || null,
    function (err) {
      if (err) return res.status(500).json({ error: 'Insert failed' });

      db.get(
        `
        SELECT m.*, u.firstname || ' ' || u.lastname AS admin_name
        FROM matches m
        JOIN users u ON m.admin_id = u.id
        WHERE m.id = ?
        `,
        [this.lastID],
        (err2, match) => {
          if (err2) return res.status(500).json({ error: 'Fetch failed' });
          res.status(201).json(match);
        }
      );
    }
  );
});

// GET /matches/:id (détails + joueurs)
router.get('/:id', (req, res) => {
  const matchId = req.params.id;

  db.get(
    `
    SELECT m.*, u.firstname || ' ' || u.lastname AS admin_name
    FROM matches m
    JOIN users u ON m.admin_id = u.id
    WHERE m.id = ?
    `,
    [matchId],
    (err, match) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (!match) return res.status(404).json({ error: 'Match not found' });

      db.all(
        `
        SELECT mp.id, mp.status, mp.user_id, mp.created_at,
               us.firstname, us.lastname, us.position, us.level
        FROM match_players mp
        JOIN users us ON mp.user_id = us.id
        WHERE mp.match_id = ?
        ORDER BY mp.status DESC, mp.created_at ASC
        `,
        [matchId],
        (err2, players) => {
          if (err2) return res.status(500).json({ error: 'Players fetch failed' });
          res.json({ match, players });
        }
      );
    }
  );
});

// POST /matches/:id/join
router.post('/:id/join', auth, (req, res) => {
  const matchId = req.params.id;
  const userId = req.user.id;

  const stmt = db.prepare(`
    INSERT OR IGNORE INTO match_players (match_id, user_id, status)
    VALUES (?, ?, 'pending')
  `);

  stmt.run(matchId, userId, function (err) {
    if (err) return res.status(500).json({ error: 'Join failed' });

    if (this.changes === 0) {
      return res.status(200).json({ message: 'Already requested or joined' });
    }

    res.status(201).json({ message: 'Join request sent' });
  });
});

// PATCH /matches/:id/players/:userId  (admin : accepter / refuser)
router.patch('/:id/players/:userId', auth, (req, res) => {
  const matchId = req.params.id;
  const playerId = req.params.userId;
  const { status } = req.body;

  if (!['pending', 'accepted', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  db.get('SELECT admin_id FROM matches WHERE id = ?', [matchId], (err, match) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!match) return res.status(404).json({ error: 'Match not found' });
    if (match.admin_id !== req.user.id) {
      return res.status(403).json({ error: 'Not allowed' });
    }

    db.run(
      `
      UPDATE match_players
      SET status = ?
      WHERE match_id = ? AND user_id = ?
      `,
      [status, matchId, playerId],
      function (err2) {
        if (err2) return res.status(500).json({ error: 'Update failed' });
        if (this.changes === 0) {
          return res.status(404).json({ error: 'Player not found in match' });
        }

        res.json({ message: 'Status updated' });
      }
    );
  });
});

// POST /matches/:id/rate  (admin note un joueur)
router.post('/:id/rate', auth, (req, res) => {
  const matchId = req.params.id;
  const { userId, rating, comment } = req.body;

  if (!userId || !rating) {
    return res.status(400).json({ error: 'Missing userId or rating' });
  }

  db.get('SELECT admin_id FROM matches WHERE id = ?', [matchId], (err, match) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!match) return res.status(404).json({ error: 'Match not found' });
    if (match.admin_id !== req.user.id) {
      return res.status(403).json({ error: 'Not allowed' });
    }

    const stmt = db.prepare(`
      INSERT INTO ratings (match_id, user_id, admin_id, rating, comment)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(matchId, userId, req.user.id, rating, comment || null, function (err2) {
      if (err2) return res.status(500).json({ error: 'Insert failed' });
      res.status(201).json({ message: 'Rating saved' });
    });
  });
});

module.exports = router;

