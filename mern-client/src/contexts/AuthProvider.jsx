import React, { createContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase/firebase.config';
import { 
  createUserWithEmailAndPassword, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut, 
  signInWithPopup, 
  GoogleAuthProvider, 
  sendEmailVerification,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

export const AuthContext = createContext();
const googleProvider = new GoogleAuthProvider();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const createUser = async (email, password, firstName, lastName) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(userCredential.user);
    await updateProfile(userCredential.user, {
      displayName: `${firstName} ${lastName}`,
      photoURL: "https://i.ibb.co/yWjpDXh/image.png"
    });
    
    await setDoc(doc(db, "users", userCredential.user.uid), {
      firstName,
      lastName,
      email,
      photoURL: "https://i.ibb.co/yWjpDXh/image.png",
      createdAt: serverTimestamp(),
      role: 'user'
    });
    
    return userCredential.user;
  };

  const login = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    if (!userCredential.user.emailVerified) {
      await sendEmailVerification(userCredential.user);
      throw new Error('Please verify your email. A verification link has been sent.');
    }
    
    await setDoc(doc(db, "users", userCredential.user.uid), {
      lastLoginAt: serverTimestamp()
    }, { merge: true });
    
    return userCredential.user;
  };

  const signInWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    const nameParts = result.user.displayName?.split(" ") || ['User'];
    
    await setDoc(doc(db, "users", result.user.uid), {
      firstName: nameParts[0],
      lastName: nameParts.slice(1).join(" ") || '',
      email: result.user.email,
      photoURL: result.user.photoURL || '',
      lastLoginAt: serverTimestamp()
    }, { merge: true });
    
    return result.user;
  };

  const logout = () => signOut(auth);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (currentUser) {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          setUser({ ...currentUser, ...userDoc.data() });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    user,
    loading,
    createUser,
    login,
    logout,
    signInWithGoogle
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;