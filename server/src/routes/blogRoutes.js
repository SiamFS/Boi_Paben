import express from 'express';
import { body, validationResult } from 'express-validator';
import { blogController } from '../controllers/blogController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

const postValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('content').trim().notEmpty().withMessage('Content is required')
];

const commentValidation = [
  body('content').trim().notEmpty().withMessage('Comment content is required')
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

router.get('/posts', optionalAuth, asyncHandler(blogController.getAllPosts));
router.get('/posts/:id', optionalAuth, asyncHandler(blogController.getPostById));

router.post(
  '/posts',
  authenticate,
  postValidation,
  handleValidationErrors,
  asyncHandler(blogController.createPost)
);

router.put(
  '/posts/:id',
  authenticate,
  postValidation,
  handleValidationErrors,
  asyncHandler(blogController.updatePost)
);

router.delete(
  '/posts/:id',
  authenticate,
  asyncHandler(blogController.deletePost)
);

router.post(
  '/posts/:id/comments',
  authenticate,
  commentValidation,
  handleValidationErrors,
  asyncHandler(blogController.addComment)
);

router.put(
  '/posts/:postId/comments/:commentId',
  authenticate,
  commentValidation,
  handleValidationErrors,
  asyncHandler(blogController.updateComment)
);

router.delete(
  '/posts/:postId/comments/:commentId',
  authenticate,
  asyncHandler(blogController.deleteComment)
);

router.post(
  '/posts/:id/react',
  authenticate,
  asyncHandler(blogController.reactToPost)
);

router.get(
  '/reactions/:userId',
  asyncHandler(blogController.getUserReactions)
);

export default router;