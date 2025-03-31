require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const coinRoutes = require('./routes/coins');
const subscriptionRoutes = require('./routes/subscription');
const kycRoutes = require('./routes/kyc');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('../frontend'));

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/coins', coinRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/kyc', kycRoutes);

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));