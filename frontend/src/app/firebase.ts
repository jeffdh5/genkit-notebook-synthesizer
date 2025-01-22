import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Use your own configuration values from Firebase console
const firebaseConfig = {
  apiKey: "AIzaSyCvFaGyodKXnF7HKYsM_KmZqqHvwc1vyOM",
  authDomain: "smarthome-d6e27.firebaseapp.com",
  projectId: "smarthome-d6e27",
  storageBucket: "smarthome-d6e27.firebasestorage.app",
  messagingSenderId: "493446833170",
  appId: "1:493446833170:web:553893d26187f7e8a9e4cb"
};


const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);