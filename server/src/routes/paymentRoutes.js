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
  '/webhook',
  express.raw({ type: 'application/json' }),
  asyncHandler(paymentController.handleWebhook)
);

router.get(
  '/history',
  authenticate,
  asyncHandler(paymentController.getPaymentHistory)
);

export default router;