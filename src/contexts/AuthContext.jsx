import React, { createContext, useState, useEffect, useContext } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc, collection } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { collections, subcollections, userSchema } from '../firebase/schema';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sign up function
  const signup = async (email, password, firstName, lastName) => {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    
    // Create user document in Firestore
    const userDoc = {
      ...userSchema,
      uid: user.uid,
      email: user.email,
      firstName,
      lastName,
      role: user.email === 'jriosvil@gmail.com' ? 'admin' : 'applicant', // Set admin for specific email
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Store user in a subcollection under a config document
    const usersCollection = collection(db, collections.VIGEO_HEALTH_CAREERS, 'config', 'users');
    await setDoc(
      doc(usersCollection, user.uid),
      userDoc
    );
    
    return user;
  };

  // Login function
  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  // Google Sign-In function
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    
    // Check if user exists in Firestore, if not create profile
    const userDoc = await getUserDetails(result.user.uid);
    if (!userDoc) {
      // Create user profile for Google sign-in users
      const newUserDoc = {
        ...userSchema,
        uid: result.user.uid,
        email: result.user.email,
        firstName: result.user.displayName?.split(' ')[0] || '',
        lastName: result.user.displayName?.split(' ').slice(1).join(' ') || '',
        role: result.user.email === 'jriosvil@gmail.com' ? 'admin' : 'applicant', // Set admin for specific email
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Store user in a subcollection under a config document
      const usersCollection = collection(db, collections.VIGEO_HEALTH_CAREERS, 'config', 'users');
      await setDoc(
        doc(usersCollection, result.user.uid),
        newUserDoc
      );
    }
    
    return result;
  };

  // Logout function
  const logout = () => {
    return signOut(auth);
  };

  // Password reset
  const resetPassword = (email) => {
    return sendPasswordResetEmail(auth, email);
  };

  // Get user details from Firestore
  const getUserDetails = async (uid) => {
    const usersCollection = collection(db, collections.VIGEO_HEALTH_CAREERS, 'config', 'users');
    const docRef = doc(usersCollection, uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        const details = await getUserDetails(user.uid);
        setUserDetails(details);
      } else {
        setCurrentUser(null);
        setUserDetails(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userDetails,
    signup,
    login,
    logout,
    resetPassword,
    signInWithGoogle
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};