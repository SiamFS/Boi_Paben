import { createContext, useState, useEffect, useMemo } from 'react';
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
import toast from 'react-hot-toast';

export const AuthContext = createContext();
const googleProvider = new GoogleAuthProvider();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const getAuthToken = async (firebaseUser) => {
    if (!firebaseUser) return null;
    
    try {
      if (process.env.NODE_ENV !== 'production') {
        console.log('🔐 Calling verify-firebase endpoint...');
      }
      
      const response = await apiClient.post('/api/auth/verify-firebase', {
        user: {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          firstName: '',
          lastName: '',
        },
      });

      if (response.data.success && response.data.token) {
        localStorage.setItem('auth_token', response.data.token);
        if (process.env.NODE_ENV !== 'production') {
          console.log('✓ Token stored successfully after verify-firebase call');
        }
        return response.data.user;
      } else {
        throw new Error('verify-firebase response missing token or success flag');
      }
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('getAuthToken error:', error);
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
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      if (process.env.NODE_ENV !== 'production') {
        console.log('🔐 Starting email/password login for:', email);
      }
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

      if (process.env.NODE_ENV !== 'production') {
        console.log('🔐 Firebase login successful, calling getAuthToken...');
      }
      const userData = await getAuthToken(userCredential.user);
      setUser(userData);
      
      if (process.env.NODE_ENV !== 'production') {
        console.log('🔐 Login complete. User set:', userData?.email);
      }
      toast.success('Welcome back!');
      return { success: true, user: userData };
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('🔐 Login error:', error);
      }
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      if (process.env.NODE_ENV !== 'production') {
        console.log('🔐 Starting Google sign-in...');
      }
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
        if (process.env.NODE_ENV !== 'production') {
          console.log('🔐 New Google user created:', result.user.email);
        }
      } else {
        await setDoc(userDocRef, { lastLoginAt: serverTimestamp() }, { merge: true });
      }

      if (process.env.NODE_ENV !== 'production') {
        console.log('🔐 Google login successful, calling getAuthToken...');
      }
      const userData = await getAuthToken(result.user);
      setUser(userData);
      
      if (process.env.NODE_ENV !== 'production') {
        console.log('🔐 Google login complete. User set:', userData?.email);
      }
      toast.success('Welcome!');
      return { success: true, user: userData };
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('🔐 Google login error:', error);
      }
      throw error;
    }
  };

  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent!');
    } catch (error) {
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
        
        const userData = await getAuthToken(auth.currentUser);
        setUser(userData);
        
        toast.success('Profile updated successfully');
      }
    } catch (error) {
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}