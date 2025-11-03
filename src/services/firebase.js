// firebase.js (CommonJS, safe singleton)
const { initializeApp, getApps, getApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getStorage } = require("firebase-admin/storage");
const dotenv = require("dotenv");

dotenv.config();

// handle empty PRIVATE_KEY safely (optional)
const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY || "";
const privateKey = rawPrivateKey.replace(/\\n/g, "\n");

// make sure required envs exist (optional but helpful in dev)
if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !privateKey) {
  console.warn("[firebase] Missing FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY");
}

// HMR/dev guard so we don’t re-initialize
if (!global.__FIREBASE_ADMIN_APP__) {
  global.__FIREBASE_ADMIN_APP__ =
    getApps().length
      ? getApp()
      : initializeApp({
          credential: cert({
            type: process.env.FIREBASE_TYPE,
            projectId: process.env.FIREBASE_PROJECT_ID,
            privateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID,
            privateKey,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            clientId: process.env.FIREBASE_CLIENT_ID,
            authUri: process.env.FIREBASE_AUTH_URI,
            tokenUri: process.env.FIREBASE_TOKEN_URI,
            authProviderX509CertUrl: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
            clientC509CertUrl: process.env.FIREBASE_CLIENT_X509_CERT_URL,
          }),
          storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        });
}

const adminApp = global.__FIREBASE_ADMIN_APP__;
const db = getFirestore(adminApp);
const bucket = getStorage(adminApp).bucket();

module.exports = { adminApp, db, bucket };
