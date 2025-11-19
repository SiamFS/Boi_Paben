import express from 'express';
import jwt from 'jsonwebtoken';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { authenticate } from '../middleware/auth.js';
import { getCollection } from '../config/database.js';

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
    // Store user in database if not exists
    const usersCollection = getCollection('users');
    let dbUser = await usersCollection.findOne({ uid: user.uid });
      
    if (!dbUser) {
      // Create new user
      const newUser = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await usersCollection.insertOne(newUser);
      dbUser = newUser;
      if (process.env.NODE_ENV !== 'production') {
        console.log('✓ New user created:', user.email);
      }
    }
    
    const tokenPayload = {
      uid: dbUser.uid,
      email: dbUser.email,
      displayName: dbUser.displayName,
      photoURL: dbUser.photoURL,
      firstName: dbUser.firstName,
      lastName: dbUser.lastName,
      role: dbUser.role || 'user'
    };

    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    if (process.env.NODE_ENV !== 'production') {
      console.log('✓ JWT token generated for user:', user.email, 'Expires in:', process.env.JWT_EXPIRE || '7d');
    }

    res.json({
      success: true,
      token,
      user: tokenPayload
    });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Firebase verification error:', error);
    }
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
    const usersCollection = getCollection('users');
    
    // Only update allowed fields
    const allowedUpdates = {
      displayName: updates.displayName,
      firstName: updates.firstName,
      lastName: updates.lastName,
      photoURL: updates.photoURL,
      updatedAt: new Date()
    };
    
    // Remove undefined values
    Object.keys(allowedUpdates).forEach(key => 
      allowedUpdates[key] === undefined && delete allowedUpdates[key]
    );
    
    await usersCollection.updateOne(
      { uid },
      { $set: allowedUpdates }
    );
    
    res.json({
      success: true,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Profile update error:', error);
    }
    res.status(500).json({
      success: false,
      error: 'Failed to update profile'
    });
  }
}));

router.post('/logout', authenticate, asyncHandler(async (req, res) => {
  const { uid } = req.user;
  
  try {
    // Nothing to do here since we're not using caching anymore
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Logout error:', error);
    }
    res.status(500).json({
      success: false,
      error: 'Failed to logout'
    });
  }
}));

export default router;