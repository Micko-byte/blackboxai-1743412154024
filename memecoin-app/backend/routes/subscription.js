const express = require('express');
const router = express.Router();
const {
  getSubscriptions,
  createCheckoutSession,
  handleWebhook
} = require('../controllers/subscription');
const { protect } = require('../middlewares/auth');

// Public routes
router.get('/', getSubscriptions);

// Protected routes
router.post('/checkout', protect, createCheckoutSession);

// Webhook needs to be public for Stripe
router.post('/webhook', express.raw({type: 'application/json'}), handleWebhook);

module.exports = router;