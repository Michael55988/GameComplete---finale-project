const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const db = require('../db');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_gamecomplete';

// Helpers Promises pour sqlite3
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
      else resolve(this); // this.lastID, this.changes
    });
  });
}

// --- Multer config pour les selfies ---
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

// --- REGISTER ---
router.post('/register', upload.single('avatar'), async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      confirmPassword,
      age,
      position,
      level,
      location,
    } = req.body;

    if (!name || !email || !phone || !password || !confirmPassword) {
      return res.status(400).json({ message: 'All champs are obligatory.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords don`t match.' });
    }

    const existingUser = await dbGet('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(400).json({ message: 'This email is already used.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    if (!req.file) {
      return res.status(400).json({ message: 'Selfie is obligatory.' });
    }
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    const result = await dbRun(
      `INSERT INTO users
       (name, email, phone, password, age, position, level, location, avatar_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        email,
        phone,
        hashedPassword,
        age ? Number(age) : null,
        position || null,
        level ? Number(level) : null,
        location || null,
        avatarUrl,
      ]
    );

    const userId = result.lastID;

    const token = jwt.sign({ id: userId }, JWT_SECRET, {
      expiresIn: '1d',
    });

    res.status(201).json({
      message: 'Account has been created successfully.',
      user: {
        id: userId,
        name,
        email,
        phone,
        age,
        position,
        level,
        location,
        avatarUrl,
      },
      token,
    });
  } catch (err) {
    console.error('Erreur register:', err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// --- LOGIN ---
router.post('/login', async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    const user = await dbGet('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(400).json({ message: 'Incorrect email or password.' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: 'Incorrect email or password.' });
    }

    const expiresIn = rememberMe ? '30d' : '1d';

    const token = jwt.sign({ id: user.id }, JWT_SECRET, {
      expiresIn,
    });

    res.json({
      message: 'Connection succeed.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        age: user.age,
        position: user.position,
        level: user.level,
        location: user.location,
        avatarUrl: user.avatar_url,
      },
    });
  } catch (err) {
    console.error('Erreur login:', err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

module.exports = router;
                    