import React, { createContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase/firebase.config';
import { 
  createUserWithEmailAndPassword, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut, 
  signInWithPopup, 
  GoogleAuthProvider, 
  sendPasswordResetEmail, 
  sendEmailVerification,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

export const AuthContext = createContext();
const googleProvider = new GoogleAuthProvider();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const createOrUpdateUser = async (userId, userData) => {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(userRef, userData);
    } else {
      const existingData = userSnap.data();
      const updatedData = {};
      Object.keys(userData).forEach(key => {
        if (userData[key] !== undefined && userData[key] !== existingData[key]) {
          updatedData[key] = userData[key];
        }
      });
      if (Object.keys(updatedData).length > 0) {
        await setDoc(userRef, updatedData, { merge: true });
      }
    }
  };

  const createUser = async (email, password, firstName, lastName) => {
    setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);
      
      await updateProfile(userCredential.user, {
        photoURL: "https://i.ibb.co/yWjpDXh/image.png"
      });
      
      await createOrUpdateUser(userCredential.user.uid, {
        firstName,
        lastName,
        email,
        photoURL: "https://i.ibb.co/yWjpDXh/image.png"
      });

      setLoading(false);
      return {
        user: userCredential.user,
        message: "Account created successfully. Please check your email for verification."
      };
  
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      if (!userCredential.user.emailVerified) {
        await signOut(auth);
        setLoading(false);
        throw new Error("Please verify your email before logging in.");
      }
      setLoading(false);
      return userCredential.user;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      const nameParts = user.displayName ? user.displayName.split(' ') : ['', ''];
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      await createOrUpdateUser(user.uid, {
        firstName,
        lastName,
        email: user.email,
        photoURL: user.photoURL || ''
      });
      
      setLoading(false);
      return user;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return "Password reset email sent. Please check your inbox.";
    } catch (error) {
      throw error;
    }
  };

  const updateUserProfile = async (updates) => {
    setLoading(true);
    try {
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, updates);
        await updateDoc(doc(db, "users", auth.currentUser.uid), updates);
        
        setUser(prevUser => ({
          ...prevUser,
          ...updates
        }));
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          setUser({
            ...currentUser,
            ...userDoc.data()
          });
        } else {
          setUser(currentUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const authInfo = {
    user,
    loading,
    createUser,
    login,
    logout,
    signInWithGoogle,
    resetPassword,
    updateUserProfile,
  };

  return (
    <AuthContext.Provider value={authInfo}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;