const express = require('express');
const router = express.Router();
const {
  register,
  login,
  verifyEmail,
  resendVerification,
  uploadKyc,
  getCurrentUser
} = require('../controllers/auth');
const { protect } = require('../middlewares/auth');
const upload = require('../middlewares/multer');

router.post('/register', register);
router.post('/login', login);
router.get('/verify/:token', verifyEmail);
router.post('/resend-verification', resendVerification);
router.post('/kyc', protect, upload.fields([
  { name: 'idFront', maxCount: 1 },
  { name: 'idBack', maxCount: 1 },
  { name: 'proofOfAddress', maxCount: 1 },
  { name: 'selfie', maxCount: 1 }
]), uploadKyc);
router.get('/me', protect, getCurrentUser);

module.exports = router;