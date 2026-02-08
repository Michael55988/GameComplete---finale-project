const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /matches
router.get('/', (req, res) => {
  db.all(
    `
    SELECT m.*, 
           u.name AS admin_name,
           (SELECT COUNT(*) FROM match_players mp WHERE mp.match_id = m.id AND mp.status = 'accepted') AS player_count
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

// POST /matches
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
        SELECT m.*, u.name AS admin_name
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
    SELECT m.*, u.name AS admin_name
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
        SELECT mp.id,
               mp.status,
               mp.user_id,
               mp.team,
               mp.position,
               mp.created_at,
               us.name,
               us.position AS real_position,
               us.level,
               us.avatar_url
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

// ----------------------------
// AUTO LINEUP (équipes équilibrées)
// ----------------------------
router.post('/:id/auto-lineup', auth, (req, res) => {
  const matchId = req.params.id;

  db.get('SELECT admin_id FROM matches WHERE id = ?', [matchId], (err, match) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!match) return res.status(404).json({ error: 'Match not found' });
    if (match.admin_id !== req.user.id) {
      return res.status(403).json({ error: 'Not allowed' });
    }

    db.all(
      `
      SELECT mp.id AS mp_id,
             u.id AS user_id,
             u.name,
             u.position,
             u.level,
             u.avatar_url
      FROM match_players mp
      JOIN users u ON mp.user_id = u.id
      WHERE mp.match_id = ?
        AND mp.status = 'accepted'
      `,
      [matchId],
      (err2, players) => {
        if (err2) return res.status(500).json({ error: 'Players fetch failed' });
        if (players.length < 2) {
          return res
            .status(400)
            .json({ error: 'Not enough accepted players to create teams' });
        }

        // tri par niveau (meilleurs en premier)
        players.sort((a, b) => (b.level || 0) - (a.level || 0));

        // slots sur le terrain
        const slots = {
          GK: ['gk'],
          DEF: ['df-l', 'df-c1', 'df-c2', 'df-r'],
          MID: ['mf-l', 'mf-c', 'mf-r'],
          ATT: ['st-l', 'st-c', 'st-r'],
        };

        const teams = {
          A: { totalLevel: 0, usedSlots: {}, assignments: [] },
          B: { totalLevel: 0, usedSlots: {}, assignments: [] },
        };

        function getCategory(pos) {
          if (!pos) return 'ATT';
          const upper = pos.toUpperCase();
          if (upper.includes('GK') || upper.includes('GARDIEN')) return 'GK';
          if (upper.includes('DEF')) return 'DEF';
          if (upper.includes('MID')) return 'MID';
          if (upper.includes('ATT') || upper.includes('STRIKER') || upper.includes('WING'))
            return 'ATT';
          return 'ATT';
        }

        function pickSlot(teamKey, category) {
          const team = teams[teamKey];
          if (!team.usedSlots[category]) team.usedSlots[category] = [];
          const available = slots[category] || slots.ATT;

          for (const s of available) {
            if (!team.usedSlots[category].includes(s)) {
              team.usedSlots[category].push(s);
              return s;
            }
          }
          // plus de slot dans ce rôle → prendre un slot ATT libre si possible
          if (category !== 'ATT') {
            if (!team.usedSlots.ATT) team.usedSlots.ATT = [];
            for (const s of slots.ATT) {
              if (!team.usedSlots.ATT.includes(s)) {
                team.usedSlots.ATT.push(s);
                return s;
              }
            }
          }
          // sinon on met au hasard au milieu
          return 'mf-c';
        }

        players.forEach((p) => {
          const category = getCategory(p.position);
          const teamKey = teams.A.totalLevel <= teams.B.totalLevel ? 'A' : 'B';
          const slot = pickSlot(teamKey, category);
          const lvl = p.level || 5;

          teams[teamKey].totalLevel += lvl;
          teams[teamKey].assignments.push({
            mp_id: p.mp_id,
            team: teamKey,
            position: slot,
          });
        });

        const allAssignments = [...teams.A.assignments, ...teams.B.assignments];

        const stmt = db.prepare(
          `UPDATE match_players SET team = ?, position = ? WHERE id = ?`
        );

        db.serialize(() => {
          allAssignments.forEach((a) => {
            stmt.run([a.team, a.position, a.mp_id]);
          });
          stmt.finalize((err3) => {
            if (err3) return res.status(500).json({ error: 'Update failed' });
            res.json({ message: 'Teams generated', teams: allAssignments });
          });
        });
      }
    );
  });
});

// GET /matches/:id/lineup
router.get('/:id/lineup', (req, res) => {
  const matchId = req.params.id;

  db.all(
    `
    SELECT mp.team,
           mp.position,
           u.name,
           u.avatar_url AS avatarUrl,
           u.position AS real_position,
           u.level
    FROM match_players mp
    JOIN users u ON mp.user_id = u.id
    WHERE mp.match_id = ?
      AND mp.status = 'accepted'
      AND mp.team IS NOT NULL
    `,
    [matchId],
    (err, rows) => {
      if (err) return res.status(500).json({ message: 'Erreur serveur.' });
      res.json({ players: rows });
    }
  );
});

module.exports = router;
