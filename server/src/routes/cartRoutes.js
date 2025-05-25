import express from 'express';
import { cartController } from '../controllers/cartController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/count', asyncHandler(cartController.getCartCount));
router.get('/', asyncHandler(cartController.getCartItems));
router.post('/add', asyncHandler(cartController.addToCart));
router.delete('/:id', asyncHandler(cartController.removeFromCart));
router.delete('/', asyncHandler(cartController.clearCart));

export default router;