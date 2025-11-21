import { initializeApp } from "firebase/app";

const firebaseConfig = {
    apiKey: "AIzaSyB_BMRsJLQZeRaPSrzuSdAQphI2YobHhoA",
    authDomain: "multiple-answer-app.firebaseapp.com",
    projectId: "multiple-answer-app",
    storageBucket: "multiple-answer-app.firebasestorage.app",
    messagingSenderId: "19048965230",
    appId: "1:19048965230:web:825af4d93e336c73eaf27f"
};

try {
    console.log("Initializing Firebase...");
    const app = initializeApp(firebaseConfig);
    console.log("Firebase initialized successfully:", app.name);
} catch (error) {
    console.error("Error initializing Firebase:", error);
}
