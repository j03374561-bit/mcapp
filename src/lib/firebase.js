import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// TODO: Replace with your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAMWiuHO4dybYHqAc3zPksxV1Yb7eD2BGo",
  authDomain: "mc-app-v1-a39e7.firebaseapp.com",
  projectId: "mc-app-v1-a39e7",
  storageBucket: "mc-app-v1-a39e7.firebasestorage.app",
  messagingSenderId: "582691403066",
  appId: "1:582691403066:web:1847e3280d33940648cc03"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const db = getFirestore(app);
export const auth = getAuth(app);
