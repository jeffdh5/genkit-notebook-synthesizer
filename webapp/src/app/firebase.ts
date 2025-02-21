import { initializeApp, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";
import dotenv from 'dotenv';

dotenv.config();

// Replace with your own configuration
const firebaseConfig = {
  apiKey: "AIzaSyABno1xvsx6O2Q_aIplxGy4Ie9TzpRvQX0",
  authDomain: "genkit-notebooklm-57bd9.firebaseapp.com",
  projectId: "genkit-notebooklm-57bd9",
  storageBucket: "genkit-notebooklm-57bd9.firebasestorage.app",
  messagingSenderId: "762217079520",
  appId: "1:762217079520:web:2f61032dd5bd875f33a685"
};

export const bucketName = firebaseConfig.storageBucket;
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const functions = getFunctions(getApp());

if (process.env.NEXT_PUBLIC_USE_FUNCTIONS_EMULATOR === 'true') {
  connectFunctionsEmulator(functions, "127.0.0.1", 5001);
}