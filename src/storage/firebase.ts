import admin, { ServiceAccount } from 'firebase-admin';
import * as firebaseCredentials from './rfid-attendance-system.json';

const serviceAccount: ServiceAccount = firebaseCredentials as ServiceAccount;

const firebasePrivateKey: string =
  process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') || '';

admin.initializeApp({
  credential: admin.credential.cert({
    ...serviceAccount,
    privateKey: firebasePrivateKey,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    projectId: process.env.FIREBASE_PROJECT_ID,
  }),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
});

const storage = admin.storage();

export default storage;
