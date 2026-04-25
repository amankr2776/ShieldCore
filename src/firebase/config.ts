
/**
 * SHIELDCORE FIREBASE CONFIGURATION
 * 
 * To find your real API key and configuration:
 * 1. Go to Firebase Console (https://console.firebase.google.com/)
 * 2. Select your project: 'shieldcore-8e715'
 * 3. Click the Cog icon (Project Settings)
 * 4. Scroll down to 'Your Apps' section
 * 5. Select your Web App and copy the 'firebaseConfig' object values
 * 6. Paste each value into the corresponding variable in your root '.env' file.
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Validation Check
const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
if (!API_KEY || API_KEY === "placeholder-api-key") {
  console.error("FIREBASE API KEY MISSING — ADD YOUR REAL KEY TO .env FILE");
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Idempotent initialization
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
