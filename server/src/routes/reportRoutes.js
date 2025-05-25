import express from 'express';
import { body, validationResult } from 'express-validator';
import { reportController } from '../controllers/reportController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

const reportValidation = [
  body('bookId').notEmpty().withMessage('Book ID is required'),
  body('reason').notEmpty().withMessage('Report reason is required'),
  body('bookTitle').notEmpty().withMessage('Book title is required')
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

router.post(
  '/',
  authenticate,
  reportValidation,
  handleValidationErrors,
  asyncHandler(reportController.createReport)
);

router.get(
  '/check/:bookId',
  authenticate,
  asyncHandler(reportController.checkReport)
);

export default router;