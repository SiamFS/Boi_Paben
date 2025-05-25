import express from 'express';
import jwt from 'jsonwebtoken';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { AuthService } from '../services/authService.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/verify-firebase', asyncHandler(async (req, res) => {
  const { user } = req.body;
  
  if (!user || !user.uid || !user.email) {
    return res.status(400).json({ 
      success: false, 
      error: 'Invalid user data' 
    });
  }

  try {
    // Verify and cache user with database integration
    const userData = await AuthService.verifyAndCacheUser(user);
    
    const tokenPayload = {
      uid: userData.uid,
      email: userData.email,
      displayName: userData.displayName,
      photoURL: userData.photoURL,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role
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
  } catch (error) {
    console.error('Firebase verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
  }
}));

router.put('/profile', authenticate, asyncHandler(async (req, res) => {
  const { uid } = req.user;
  const updates = req.body;
  
  try {
    await AuthService.updateUserProfile(uid, updates);
    
    res.json({
      success: true,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile'
    });
  }
}));

router.post('/logout', authenticate, asyncHandler(async (req, res) => {
  const { uid } = req.user;
  
  try {
    // Clear user cache on logout
    AuthService.clearUserCache(uid);
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to logout'
    });
  }
}));

export default router;