const express = require('express');
const router = express.Router();
const { uploadKyc, getKycStatus } = require('../controllers/kyc');
const { protect } = require('../middlewares/auth');
const upload = require('../middlewares/multer');

router.post(
  '/',
  protect,
  upload.fields([
    { name: 'idFront', maxCount: 1 },
    { name: 'idBack', maxCount: 1 },
    { name: 'proofOfAddress', maxCount: 1 },
    { name: 'selfie', maxCount: 1 }
  ]),
  uploadKyc
);

router.get('/status', protect, getKycStatus);

module.exports = router;