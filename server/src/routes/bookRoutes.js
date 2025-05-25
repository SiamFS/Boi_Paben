import express from 'express';
import { body, validationResult } from 'express-validator';
import { bookController } from '../controllers/bookController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

const bookValidationRules = [
  body('bookTitle').trim().notEmpty().withMessage('Book title is required'),
  body('authorName').trim().notEmpty().withMessage('Author name is required'),
  body('Price').isNumeric().withMessage('Price must be a number'),
  body('category').notEmpty().withMessage('Category is required'),
  body('imageURL').isURL().withMessage('Valid image URL required')
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Recommendation routes
router.get('/recommendations', optionalAuth, asyncHandler(bookController.getRecommendations));
router.get('/latest', asyncHandler(bookController.getLatestBooks));
router.get('/:id/similar', asyncHandler(bookController.getSimilarBooks));
router.post('/personalized', authenticate, asyncHandler(bookController.getPersonalizedRecommendations));

// Development route to seed sample data
router.post('/seed', asyncHandler(bookController.seedSampleData));
router.delete('/clear', asyncHandler(bookController.clearSampleData));

router.get('/all', asyncHandler(bookController.getAllBooks));
router.get('/search/:query', asyncHandler(bookController.searchBooks));
router.get('/category/:category', asyncHandler(bookController.getBooksByCategory));
router.get('/user/:email', authenticate, asyncHandler(bookController.getUserBooks));
router.get('/:id', asyncHandler(bookController.getBookById));

router.post(
  '/upload',
  authenticate,
  bookValidationRules,
  handleValidationErrors,
  asyncHandler(bookController.uploadBook)
);

router.patch(
  '/:id',
  authenticate,
  asyncHandler(bookController.updateBook)
);

router.delete(
  '/:id',
  authenticate,
  asyncHandler(bookController.deleteBook)
);

export default router;