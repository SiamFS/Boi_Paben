import express from 'express';
import jwt from 'jsonwebtoken';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = express.Router();

router.post('/verify-firebase', asyncHandler(async (req, res) => {
  const { user } = req.body;
  
  if (!user || !user.uid || !user.email) {
    return res.status(400).json({ 
      success: false, 
      error: 'Invalid user data' 
    });
  }

  const tokenPayload = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    firstName: user.firstName || '',
    lastName: user.lastName || ''
  };

  const token = jwt.sign(
    tokenPayload,
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );

  res.json({
    success: true,
    token,
    user: tokenPayload
  });
}));

export default router;