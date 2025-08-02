import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';


// Firebase configuration
// Use window.firebaseConfig if available (in production), otherwise fallback to environment variables (for local dev)
const firebaseConfig = typeof window !== 'undefined' && (window as any).firebaseConfig
  ? (window as any).firebaseConfig
  : {
      apiKey: process.env.FIREBASE_API_KEY || "your-api-key",
      authDomain: process.env.FIREBASE_AUTH_DOMAIN || "your-project.firebaseapp.com",
      projectId: process.env.FIREBASE_PROJECT_ID || "your-project-id",
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "your-project.appspot.com",
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "123456789",
      appId: process.env.FIREBASE_APP_ID || "your-app-id"
    };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app; 