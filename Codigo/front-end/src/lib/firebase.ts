import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCP2CHCpKRBOEL0hoRjO8usodF2_YubucI",
  authDomain: "finacial-controller.firebaseapp.com",
  projectId: "finacial-controller",
  storageBucket: "finacial-controller.firebasestorage.app",
  messagingSenderId: "1028808228447",
  appId: "1:1028808228447:web:163a706ff5182a94b065ea",
  measurementId: "G-4BWD9HJ2GH"
};

// Initialize Firebase
let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Auth
export const auth: Auth = getAuth(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

export default app;

