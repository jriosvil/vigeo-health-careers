// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// <https://firebase.google.com/docs/web/setup#available-libraries>

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
apiKey: "AIzaSyAbQJ8DutUoj24O8foQoO6y5wGT6KUGAYE",
authDomain: "[vigeoptwebsite.firebaseapp.com](http://vigeoptwebsite.firebaseapp.com)",
projectId: "vigeoptwebsite",
storageBucket: "vigeoptwebsite.firebasestorage.app",
messagingSenderId: "602281474558",
appId: "1:602281474558:web:06b2d6d0f3ebccc66168af",
measurementId: "G-LS9YKSGPBC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);