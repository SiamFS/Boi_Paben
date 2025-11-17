import { createContext, useState, useEffect, useContext, useMemo } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, getDB } from '@/lib/firebase';
import apiClient from '@/lib/api-client';
import cache from '@/lib/cache';
import toast from 'react-hot-toast';

const AuthContext = createContext();
const googleProvider = new GoogleAuthProvider();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const getAuthToken = async (firebaseUser) => {
    if (!firebaseUser) return null;
    
    // Check cache first for faster authentication
    const cacheKey = `auth_${firebaseUser.uid}`;
    const cachedUser = cache.get(cacheKey);
    if (cachedUser) {
      return cachedUser;
    }

    // Also check Firestore user doc cache
    const firestoreCacheKey = `firestore_user_${firebaseUser.uid}`;
    let userData = cache.get(firestoreCacheKey);

    try {
      // Only fetch from Firestore if not cached
      if (!userData) {
        const db = await getDB();
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        userData = userDoc.data() || {};
        // Cache Firestore data for 24 hours
        cache.set(firestoreCacheKey, userData, 86400);
      }
      
      const response = await apiClient.post('/api/auth/verify-firebase', {
        user: {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          firstName: userData.firstName,
          lastName: userData.lastName,
        },
      });

      if (response.data.success) {
        localStorage.setItem('auth_token', response.data.token);
        // Cache user data for 1 hour (3600 seconds)
        cache.set(cacheKey, response.data.user, 3600);
        return response.data.user;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
      // Return cached data as fallback if available
      if (cachedUser) {
        console.log('Using cached auth data as fallback');
        return cachedUser;
      }
      throw error;
    }
  };

  const createUser = async (email, password, firstName, lastName) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Use a default avatar URL (initials-based avatar service)
      const defaultAvatarUrl = `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=random`;
      
      await updateProfile(userCredential.user, {
        displayName: `${firstName} ${lastName}`,
        photoURL: defaultAvatarUrl,
      });

      const db = await getDB();
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        firstName,
        lastName,
        email,
        photoURL: defaultAvatarUrl,
        createdAt: serverTimestamp(),
        role: 'user',
      });

      await sendEmailVerification(userCredential.user);
      
      toast.success('Account created! Please verify your email.');
      return { success: true, message: 'Please check your email for verification.' };
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      if (!userCredential.user.emailVerified) {
        await sendEmailVerification(userCredential.user);
        await signOut(auth);
        throw new Error('Please verify your email. A new verification link has been sent.');
      }

      const db = await getDB();
      await setDoc(
        doc(db, 'users', userCredential.user.uid),
        { lastLoginAt: serverTimestamp() },
        { merge: true }
      );

      const userData = await getAuthToken(userCredential.user);
      setUser(userData);
      
      toast.success('Welcome back!');
      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const db = await getDB();
      const userDocRef = doc(db, 'users', result.user.uid);
      const userSnapshot = await getDoc(userDocRef);

      if (!userSnapshot.exists()) {
        const nameParts = result.user.displayName?.split(' ') || ['User'];
        await setDoc(userDocRef, {
          firstName: nameParts[0],
          lastName: nameParts.slice(1).join(' ') || '',
          email: result.user.email,
          photoURL: result.user.photoURL || '',
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
          role: 'user',
        });
      } else {
        await setDoc(userDocRef, { lastLoginAt: serverTimestamp() }, { merge: true });
      }

      const userData = await getAuthToken(result.user);
      setUser(userData);
      
      toast.success('Welcome!');
      return { success: true, user: userData };
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw error;
    }
  };

  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent!');
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('auth_token');
      setUser(null);
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };
  const updateUserProfile = async (updates) => {
    try {
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, updates);
        
        const db = await getDB();
        const userDocRef = doc(db, 'users', auth.currentUser.uid);
        await setDoc(userDocRef, updates, { merge: true });
        
        // Clear cache to force refresh
        const cacheKey = `auth_${auth.currentUser.uid}`;
        cache.delete(cacheKey);
        
        const userData = await getAuthToken(auth.currentUser);
        setUser(userData);
        
        toast.success('Profile updated successfully');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile');
    }
  };

  useEffect(() => {
    let timeoutId;
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser && firebaseUser.emailVerified) {
          const userData = await getAuthToken(firebaseUser);
          setUser(userData);
        } else {
          setUser(null);
          localStorage.removeItem('auth_token');
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    // Set a timeout to stop loading after 5 seconds even if auth is still checking
    timeoutId = setTimeout(() => {
      setLoading(false);
    }, 5000);

    return () => {
      unsubscribe();
      clearTimeout(timeoutId);
    };
  }, []);

  const value = {
    user,
    loading,
    createUser,
    login,
    logout,
    signInWithGoogle,
    resetPassword,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}