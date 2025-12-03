const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /users/me
router.get('/me', auth, (req, res) => {
  db.get(
    'SELECT id, firstname, lastname, email, age, position, level, location FROM users WHERE id = ?',
    [req.user.id],
    (err, user) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json(user);
    }
  );
});

// GET /users/:id/ratings
router.get('/:id/ratings', (req, res) => {
  const userId = req.params.id;

  db.all(
    `
    SELECT r.rating, r.comment, r.created_at,
           m.title AS match_title
    FROM ratings r
    JOIN matches m ON r.match_id = m.id
    WHERE r.user_id = ?
    ORDER BY r.created_at DESC
    `,
    [userId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json(rows);
    }
  );
});

module.exports = router;
