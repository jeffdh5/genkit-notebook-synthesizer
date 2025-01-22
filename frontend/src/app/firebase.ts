import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Use your own configuration values from Firebase console
const firebaseConfig = {
};


const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);