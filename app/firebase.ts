import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCyu0NK6dAQ_Nwp6CpwHyejq_BoknjaXhg",
  authDomain: "marta-letterbo.firebaseapp.com",
  projectId: "marta-letterbo",
  storageBucket: "marta-letterbo.firebasestorage.app",
  messagingSenderId: "147508103556",
  appId: "1:147508103556:web:872a8d3fd2a3f3efd275d1",
  measurementId: "G-FE13KRK9GD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore Database
export const db = getFirestore(app);

// Initialize Analytics only in browser (Next.js compatible)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;
