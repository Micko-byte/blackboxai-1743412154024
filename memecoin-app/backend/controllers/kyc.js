const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const path = require('path');

// @desc    Upload KYC documents
// @route   POST /api/kyc
// @access  Private
exports.uploadKyc = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    // Check if files were uploaded
    if (!req.files) {
      return next(new ErrorResponse('Please upload all required documents', 400));
    }

    // Update user with document paths
    user.kycDocuments = {
      idFront: req.files.idFront ? `/uploads/kyc/${req.files.idFront[0].filename}` : user.kycDocuments.idFront,
      idBack: req.files.idBack ? `/uploads/kyc/${req.files.idBack[0].filename}` : user.kycDocuments.idBack,
      proofOfAddress: req.files.proofOfAddress ? `/uploads/kyc/${req.files.proofOfAddress[0].filename}` : user.kycDocuments.proofOfAddress,
      selfie: req.files.selfie ? `/uploads/kyc/${req.files.selfie[0].filename}` : user.kycDocuments.selfie
    };

    user.kycStatus = 'pending';
    await user.save();

    res.status(200).json({
      success: true,
      data: 'KYC documents uploaded successfully. Verification in progress.'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get KYC status
// @route   GET /api/kyc/status
// @access  Private
exports.getKycStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('kycStatus kycDocuments');

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    res.status(200).json({
      success: true,
      data: {
        status: user.kycStatus,
        documents: user.kycDocuments
      }
    });
  } catch (err) {
    next(err);
  }
};