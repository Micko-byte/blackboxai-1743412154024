const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Please provide email'],
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: 'Please provide valid email'
    }
  },
  password: {
    type: String,
    required: [true, 'Please provide password'],
    minlength: 8,
    select: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  verificationTokenExpires: Date,
  kycStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'unverified'],
    default: 'unverified'
  },
  kycDocuments: {
    idFront: String,
    idBack: String,
    proofOfAddress: String,
    selfie: String
  },
  subscription: {
    type: mongoose.Schema.ObjectId,
    ref: 'Subscription'
  },
  subscriptionExpires: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
UserSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Generate JWT token
UserSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    { userId: this._id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// Compare password
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);