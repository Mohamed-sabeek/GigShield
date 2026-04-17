const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const workerRoutes = require('./routes/worker');
const policyRoutes = require('./routes/policy');
const claimRoutes = require('./routes/claim');
const adminRoutes = require('./routes/admin');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/worker', workerRoutes);
app.use('/api/policy', policyRoutes);
app.use('/api/claims', claimRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/weather', require('./routes/weather'));
app.use('/api/users', require('./routes/user'));
app.use('/api/location', require('./routes/location'));
app.use('/api/config', require('./routes/config'));

// Root route (for testing)
app.get('/', (req, res) => {
  res.send("GigShield API running 🚀");
});

// Config
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Safety check
if (!MONGO_URI) {
  console.error("❌ MONGO_URI is missing");
  process.exit(1);
}

// Connect DB and start server
mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 5000 // fail fast
})
.then(() => {
  console.log('✅ Connected to MongoDB');

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
})
.catch(err => {
  console.error('❌ Database connection error:', err.message);
  process.exit(1);
});