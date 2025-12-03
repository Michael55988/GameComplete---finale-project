const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_gamecomplete';

// POST /auth/register
router.post('/register', (req, res) => {
  const {
    firstname,
    lastname,
    email,
    password,
    age,
    position,
    level,
    location
  } = req.body;

  if (!email || !password || !firstname || !lastname) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  db.get(`SELECT id FROM users WHERE email = ?`, [email], (err, existing) => {
    if (err) {
      console.log('REGISTER DB ERROR (check email):', err.message);
      return res.status(500).json({ error: 'Database error' });
    }

    if (existing) {
      return res.status(400).json({ error: 'Email already used' });
    }

    const hash = bcrypt.hashSync(password, 10);

    db.run(
      `
      INSERT INTO users (firstname, lastname, email, password, age, position, level, location)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [firstname, lastname, email, hash, age, position, level, location],
      function (err2) {
        if (err2) {
          console.log('REGISTER DB ERROR (insert):', err2.message);
          return res.status(500).json({ error: 'Insert failed' });
        }

        const user = {
          id: this.lastID,
          firstname,
          lastname,
          email,
          age,
          position,
          level,
          location
        };

        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({ token, user });
      }
    );
  });
});

// POST /auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Missing credentials' });
  }

  db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, user) => {
    if (err) {
      console.log('LOGIN DB ERROR:', err.message);
      return res.status(500).json({ error: 'Database error' });
    }

    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const cleanUser = {
      id: user.id,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      age: user.age,
      position: user.position,
      level: user.level,
      location: user.location
    };

    const token = jwt.sign({ id: cleanUser.id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user: cleanUser });
  });
});

module.exports = router;
