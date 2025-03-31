const Subscription = require('../models/Subscription');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// @desc    Get all subscriptions
// @route   GET /api/subscriptions
// @access  Public
exports.getSubscriptions = async (req, res, next) => {
  try {
    const subscriptions = await Subscription.find();
    res.status(200).json({
      success: true,
      count: subscriptions.length,
      data: subscriptions
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create subscription checkout session
// @route   POST /api/subscriptions/checkout
// @access  Private
exports.createCheckoutSession = async (req, res, next) => {
  try {
    const subscription = await Subscription.findById(req.body.subscriptionId);
    
    if (!subscription) {
      return next(new ErrorResponse('Subscription not found', 404));
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: subscription.stripePriceId,
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/subscription/canceled`,
      customer_email: req.user.email,
      metadata: {
        userId: req.user.id.toString(),
        subscriptionId: subscription._id.toString()
      }
    });

    res.status(200).json({
      success: true,
      sessionId: session.id
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Handle Stripe webhook
// @route   POST /api/subscriptions/webhook
// @access  Public
exports.handleWebhook = async (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle successful payment
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    // Update user subscription
    await User.findByIdAndUpdate(session.metadata.userId, {
      subscription: session.metadata.subscriptionId,
      subscriptionExpires: new Date(Date.now() + 
        (await Subscription.findById(session.metadata.subscriptionId)).duration * 24 * 60 * 60 * 1000)
    });
  }

  res.json({ received: true });
};