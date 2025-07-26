import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  // TODO: Replace these values with your Firebase project configuration
  apiKey: "AIzaSyC3eNwGllxI4HJ6ihWh8_BypV3YOvZoIvU",
  authDomain: "bustrackingapp-94eeb.firebaseapp.com",
  databaseURL: "https://bustrackingapp-94eeb-default-rtdb.firebaseio.com",
  projectId: "bustrackingapp-94eeb",
  storageBucket: "bustrackingapp-94eeb.firebasestorage.app",
  messagingSenderId: "1077366665315",
  appId: "1:1077366665315:web:df9c56596de51567d48856",
  measurementId: "G-WFB4MZ80TQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Auth
const auth = getAuth(app);

// Initialize Analytics
const analytics = getAnalytics(app);

export { db, auth, analytics }; 