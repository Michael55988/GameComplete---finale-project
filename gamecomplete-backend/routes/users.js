const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Multer config pour les avatars
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads', 'avatars'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '');
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1e9) + ext);
  },
});

const upload = multer({ storage });

// Helper functions
function dbGet(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function dbRun(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

// GET /users/me
router.get('/me', auth, (req, res) => {
  db.get(
    'SELECT id, name, email, phone, age, position, level, location, avatar_url FROM users WHERE id = ?',
    [req.user.id],
    (err, user) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json(user);
    }
  );
});

// PATCH /users/me - Update profile
router.patch('/me', auth, upload.single('avatar'), async (req, res) => {
  try {
    const { name, phone, age, position, level, location } = req.body;
    const updates = {};
    const params = [];

    if (name) {
      updates.name = name;
      params.push(name);
    }
    if (phone !== undefined) {
      updates.phone = phone;
      params.push(phone);
    }
    if (age !== undefined) {
      updates.age = age ? Number(age) : null;
      params.push(updates.age);
    }
    if (position !== undefined) {
      updates.position = position || null;
      params.push(updates.position);
    }
    if (level !== undefined) {
      updates.level = level ? Number(level) : null;
      params.push(updates.level);
    }
    if (location !== undefined) {
      updates.location = location || null;
      params.push(updates.location);
    }

    if (req.file) {
      updates.avatar_url = `/uploads/avatars/${req.file.filename}`;
      params.push(updates.avatar_url);
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const fields = Object.keys(updates).map((key) => `${key} = ?`).join(', ');
    params.push(req.user.id);

    await dbRun(
      `UPDATE users SET ${fields} WHERE id = ?`,
      params
    );

    const updatedUser = await dbGet(
      'SELECT id, name, email, phone, age, position, level, location, avatar_url FROM users WHERE id = ?',
      [req.user.id]
    );

    res.json(updatedUser);
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Could not update profile' });
  }
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

// GET /users/:id/stats - Get user statistics
router.get('/:id/stats', (req, res) => {
  const userId = req.params.id;

  // Get matches played (all statuses)
  db.get(
    `SELECT COUNT(DISTINCT match_id) as matches_played
     FROM match_players
     WHERE user_id = ?`,
    [userId],
    (err, matchCount) => {
      if (err) {
        console.error('Stats error:', err);
        return res.json({ matches_played: 0, matches_accepted: 0, avg_rating: null, total_ratings: 0 });
      }

      // Get accepted matches
      db.get(
        `SELECT COUNT(DISTINCT match_id) as matches_accepted
         FROM match_players
         WHERE user_id = ? AND status = 'accepted'`,
        [userId],
        (err2, acceptedCount) => {
          if (err2) {
            console.error('Stats error:', err2);
            return res.json({ matches_played: matchCount?.matches_played || 0, matches_accepted: 0, avg_rating: null, total_ratings: 0 });
          }

          // Get ratings
          db.get(
            `SELECT AVG(rating) as avg_rating, COUNT(id) as total_ratings
             FROM ratings
             WHERE user_id = ?`,
            [userId],
            (err3, ratingData) => {
              if (err3) {
                console.error('Stats error:', err3);
                return res.json({
                  matches_played: matchCount?.matches_played || 0,
                  matches_accepted: acceptedCount?.matches_accepted || 0,
                  avg_rating: null,
                  total_ratings: 0
                });
              }

              res.json({
                matches_played: matchCount?.matches_played || 0,
                matches_accepted: acceptedCount?.matches_accepted || 0,
                avg_rating: ratingData?.avg_rating || null,
                total_ratings: ratingData?.total_ratings || 0
              });
            }
          );
        }
      );
    }
  );
});

module.exports = router;
