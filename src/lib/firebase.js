import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// TODO: Replace with your Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY", // Placeholder replaced
  authDomain: "multiple-answer-app.firebaseapp.com",
  projectId: "multiple-answer-app",
  storageBucket: "multiple-answer-app.firebasestorage.app",
  messagingSenderId: "19048965230",
  appId: "1:19048965230:web:825af4d93e336c73eaf27f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const db = getFirestore(app);
export const auth = getAuth(app);
