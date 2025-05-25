import NodeCache from 'node-cache';
import { getCollection } from '../config/database.js';

// Cache with 1 hour TTL for user data
const userCache = new NodeCache({ stdTTL: 3600 });

export class AuthService {
  static async verifyAndCacheUser(firebaseUser) {
    const cacheKey = `user_${firebaseUser.uid}`;
    
    // Check cache first
    let userData = userCache.get(cacheKey);
    if (userData) {
      return userData;
    }

    try {
      const usersCollection = getCollection('users');
      
      // Get or create user in MongoDB
      let dbUser = await usersCollection.findOne({ uid: firebaseUser.uid });
      
      if (!dbUser) {
        // Create new user if doesn't exist
        const newUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || '',
          photoURL: firebaseUser.photoURL || '',
          firstName: firebaseUser.firstName || '',
          lastName: firebaseUser.lastName || '',
          role: 'user',
          createdAt: new Date(),
          lastLoginAt: new Date()
        };
        
        await usersCollection.insertOne(newUser);
        dbUser = newUser;
      } else {
        // Update last login
        await usersCollection.updateOne(
          { uid: firebaseUser.uid },
          { $set: { lastLoginAt: new Date() } }
        );
      }

      userData = {
        uid: dbUser.uid,
        email: dbUser.email,
        displayName: dbUser.displayName,
        photoURL: dbUser.photoURL,
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        role: dbUser.role || 'user'
      };

      // Cache the user data
      userCache.set(cacheKey, userData);
      
      return userData;
    } catch (error) {
      console.error('Error in verifyAndCacheUser:', error);
      throw error;
    }
  }

  static clearUserCache(uid) {
    userCache.del(`user_${uid}`);
  }

  static async updateUserProfile(uid, updates) {
    try {
      const usersCollection = getCollection('users');
      
      await usersCollection.updateOne(
        { uid },
        { $set: { ...updates, updatedAt: new Date() } }
      );

      // Clear cache to force refresh
      this.clearUserCache(uid);
      
      return true;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }
}
