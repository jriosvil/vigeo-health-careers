import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAbQJ8DutUoj24O8foQoO6y5wGT6KUGAYE",
  authDomain: "vigeoptwebsite.firebaseapp.com",
  projectId: "vigeoptwebsite",
  storageBucket: "vigeoptwebsite.firebasestorage.app",
  messagingSenderId: "602281474558",
  appId: "1:602281474558:web:06b2d6d0f3ebccc66168af",
  measurementId: "G-L89YK5DFBC"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;