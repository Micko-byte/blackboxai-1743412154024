const express = require('express');
const router = express.Router();
const {
  snipeCoin,
  deployCoin,
  bundleCoins
} = require('../controllers/coins');
const { protect, requireKYC } = require('../middlewares/auth');

// All coin operations require authentication and KYC verification
router.use(protect);
router.use(requireKYC);

// Coin operation endpoints
router.post('/snipe/:platform', snipeCoin);
router.post('/deploy/:platform', deployCoin);
router.post('/bundle/:platform', bundleCoins);

module.exports = router;