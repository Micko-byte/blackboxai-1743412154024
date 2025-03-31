const axios = require('axios');
const ErrorResponse = require('../utils/errorResponse');
const { protect, requireKYC } = require('../middlewares/auth');

// Platform API configurations
const PLATFORMS = {
  'pump.fun': {
    baseUrl: 'https://api.pump.fun',
    endpoints: {
      snipe: '/snipe',
      deploy: '/deploy',
      bundle: '/bundle'
    }
  },
  'axiom': {
    baseUrl: 'https://api.axiom.pro',
    endpoints: {
      snipe: '/v1/snipe',
      deploy: '/v1/deploy',
      bundle: '/v1/bundle'
    }
  },
  'photon': {
    baseUrl: 'https://api.photon.network',
    endpoints: {
      snipe: '/api/snipe',
      deploy: '/api/deploy',
      bundle: '/api/bundle'
    }
  }
};

// @desc    Snipe a coin
// @route   POST /api/coins/snipe/:platform
// @access  Private (requires KYC)
exports.snipeCoin = async (req, res, next) => {
  try {
    const platform = PLATFORMS[req.params.platform];
    if (!platform) {
      return next(new ErrorResponse('Invalid platform', 400));
    }

    const response = await axios.post(
      `${platform.baseUrl}${platform.endpoints.snipe}`,
      req.body,
      {
        headers: {
          'Authorization': `Bearer ${process.env[`${req.params.platform.toUpperCase()}_API_KEY`]}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.status(200).json({
      success: true,
      data: response.data
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Deploy a coin
// @route   POST /api/coins/deploy/:platform
// @access  Private (requires KYC)
exports.deployCoin = async (req, res, next) => {
  try {
    const platform = PLATFORMS[req.params.platform];
    if (!platform) {
      return next(new ErrorResponse('Invalid platform', 400));
    }

    const response = await axios.post(
      `${platform.baseUrl}${platform.endpoints.deploy}`,
      req.body,
      {
        headers: {
          'Authorization': `Bearer ${process.env[`${req.params.platform.toUpperCase()}_API_KEY`]}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.status(200).json({
      success: true,
      data: response.data
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Bundle coins
// @route   POST /api/coins/bundle/:platform
// @access  Private (requires KYC)
exports.bundleCoins = async (req, res, next) => {
  try {
    const platform = PLATFORMS[req.params.platform];
    if (!platform) {
      return next(new ErrorResponse('Invalid platform', 400));
    }

    const response = await axios.post(
      `${platform.baseUrl}${platform.endpoints.bundle}`,
      req.body,
      {
        headers: {
          'Authorization': `Bearer ${process.env[`${req.params.platform.toUpperCase()}_API_KEY`]}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.status(200).json({
      success: true,
      data: response.data
    });
  } catch (err) {
    next(err);
  }
};