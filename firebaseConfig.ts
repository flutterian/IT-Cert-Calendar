import { FirebaseApp, FirebaseOptions, getApp, getApps, initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const requiredEnvKeys = [
  'EXPO_PUBLIC_FIREBASE_API_KEY',
  'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
  'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'EXPO_PUBLIC_FIREBASE_APP_ID',
];

const missingKeys = requiredEnvKeys.filter((key) => !process.env[key]);

if (__DEV__ && missingKeys.length) {
  console.warn(
    `[firebase] Missing environment values: ${missingKeys.join(
      ', ',
    )}. Add them to your app config (e.g. app.json -> extra) before shipping.`,
  );
}

// const firebaseConfig: FirebaseOptions = {
//   apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
//   authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
//   projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
//   storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
//   appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
// };

const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyBpV7NGaIljWEcqBW8Znyre2bTuZ6tbf-E",
  authDomain: "it-cert-calendar.firebaseapp.com",
  projectId: "it-cert-calendar",
  storageBucket: "it-cert-calendar.firebasestorage.app",
  messagingSenderId: "813541178168",
  appId: "1:813541178168:web:34711c4eb8a02e32621fcd",
  measurementId: "G-JDLLWBX639",
};

console.log({ firebaseConfig });

const firebaseApp: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const firestoreDb = getFirestore(firebaseApp);
