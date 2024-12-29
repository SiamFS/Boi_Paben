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
      await updateDoc(userRef, userData);
    }
  };

  const createUser = async (email, password, firstName, lastName) => {
    setLoading(true);
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(userCredential.user);
    await updateProfile(userCredential.user, {
      displayName: `${firstName} ${lastName}`,
      photoURL: "https://i.ibb.co/yWjpDXh/image.png"
    });
    await createOrUpdateUser(userCredential.user.uid, {
      firstName,
      lastName,
      email,
      photoURL: "https://i.ibb.co/yWjpDXh/image.png"
    });
    setLoading(false);
  };

  const login = async (email, password) => {
    setLoading(true);
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    if (!userCredential.user.emailVerified) {
      throw new Error("Please verify your email before logging in.");
    }
    setLoading(false);
    return userCredential.user;
  };

  const logout = async () => {
    await signOut(auth);
  };

  const signInWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const nameParts = user.displayName.split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ");
    await createOrUpdateUser(user.uid, {
      firstName,
      lastName,
      email: user.email,
      photoURL: user.photoURL || ''
    });
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        setUser({ ...currentUser, ...userDoc.data() });
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, createUser, login, logout, signInWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
