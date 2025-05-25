import express from 'express';
import { body, validationResult } from 'express-validator';
import { bookController } from '../controllers/bookController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { authenticate } from '../middleware/auth.js';

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