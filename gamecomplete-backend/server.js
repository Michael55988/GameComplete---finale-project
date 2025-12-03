const express = require('express');
const cors = require('cors');
require('dotenv').config();
require('./db'); // pour initialiser la DB

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const matchRoutes = require('./routes/matches');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(
  cors({
    origin: 'http://localhost:5173',
  })
);
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'GameComplete API is running' });
});

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/matches', matchRoutes);

app.listen(PORT, () => {
  console.log(`GameComplete backend running on http://localhost:${PORT}`);
});
