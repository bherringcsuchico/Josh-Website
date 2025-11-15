const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const gameRoutes = require('./routes/gameRoutes');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to database
connectDB();

// Routes
app.use('/api', gameRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Monopoly API is running' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
