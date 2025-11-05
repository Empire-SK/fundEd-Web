// IMPORTANT: This file is only intended for use on the server-side,
// for example in API routes or server components. It uses the Firebase Admin SDK.
import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { firebaseConfig } from '@/firebase/config';

// This is a simplified check. In a real app, you'd use a secure way to load
// service account credentials, like environment variables or a secret manager.
// Support either raw JSON in FIREBASE_SERVICE_ACCOUNT or base64-encoded JSON in
// FIREBASE_SERVICE_ACCOUNT_B64. Many hosting providers make it easier to paste a
// single-line base64 secret, so accept both.
let serviceAccount: any = undefined;
const rawServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT || process.env.FIREBASE_SERVICE_ACCOUNT_B64;
if (rawServiceAccount) {
  try {
    const jsonString = process.env.FIREBASE_SERVICE_ACCOUNT
      ? process.env.FIREBASE_SERVICE_ACCOUNT
      : Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_B64 as string, 'base64').toString('utf8');
    serviceAccount = JSON.parse(jsonString);
  } catch (err) {
    console.warn('Failed to parse FIREBASE_SERVICE_ACCOUNT / FIREBASE_SERVICE_ACCOUNT_B64. Ensure it is valid JSON (or base64-encoded JSON).');
  }
}

let adminApp: App;

if (!getApps().length) {
  if (serviceAccount) {
    adminApp = initializeApp({
      credential: cert(serviceAccount),
      databaseURL: `https://${firebaseConfig.projectId}.firebaseio.com`,
    });
  } else {
    // Fallback for environments without service account (e.g., local dev)
    // Note: without credentials the Admin SDK will attempt to use Application
    // Default Credentials (ADC). For local development you can run
    // `gcloud auth application-default login` or set GOOGLE_APPLICATION_CREDENTIALS
    // to a service account file. See: https://cloud.google.com/docs/authentication/getting-started
    adminApp = initializeApp({ projectId: firebaseConfig.projectId });
    console.warn("Firebase Admin SDK initialized without explicit service account credentials. Ensure ADC or a service account is available for Firestore access.");
  }
} else {
  adminApp = getApps()[0];
}

const firestore = getFirestore(adminApp);

export const initializeFirebase = () => ({
  firestore,
  app: adminApp,
});
