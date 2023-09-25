import * as firebaseAdmin from "firebase-admin";
if (!firebaseAdmin.apps.length) {
  firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY!?.replace(/\\n/g, "\n"),
    }),
    databaseURL: (process?.env?.FIREBASE_DATABASE_URL as string) ?? "",
    projectId: process?.env?.FIREBASE_PROJECT_ID ?? "",
    storageBucket: process?.env?.FIREBASE_STORAGE_BUCKET ?? "",
  });
}

export default firebaseAdmin;
