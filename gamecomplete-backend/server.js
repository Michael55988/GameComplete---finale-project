const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
require('./db'); // pour initialiser la DB

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const matchRoutes = require('./routes/matches');

const app = express();
const PORT = process.env.PORT || 4000;

// CORS configuration - allow both local and production URLs
const allowedOrigins = [
  'http://localhost:5173',
  'https://gamecomplete-frontend.onrender.com', // Your Render frontend URL
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);
app.use(express.json());

// servir les images (selfies)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.json({ message: 'GameComplete API is running' });
});

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/matches', matchRoutes);

app.listen(PORT, () => {
  console.log(`GameComplete backend running on http://localhost:${PORT}`);
});
