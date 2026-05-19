const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : '*',
}));
app.use(express.json());
const uploadsPath = process.env.VERCEL ? '/tmp/uploads' : path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/feed', require('./routes/feed'));
app.use('/api/network', require('./routes/network'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/search', require('./routes/search'));

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'ConnectDev API is running 🚀' });
});

if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
}

module.exports = app;