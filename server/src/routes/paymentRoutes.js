import express from 'express';
import { paymentController } from '../controllers/paymentController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post(
  '/create-checkout-session',
  authenticate,
  asyncHandler(paymentController.createCheckoutSession)
);

router.post(
  '/cash-on-delivery',
  authenticate,
  asyncHandler(paymentController.processCashOnDelivery)
);

router.post(
  '/complete-stripe-payment',
  authenticate,
  asyncHandler(paymentController.completeStripePayment)
);

// Webhook route removed - not needed for testing

router.get(
  '/history',
  authenticate,
  asyncHandler(paymentController.getPaymentHistory)
);

export default router;