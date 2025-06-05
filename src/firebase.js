// src/firebase.js
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "YOUR-KEY",
  authDomain: "your-app.firebaseapp.com",
  projectId: "your-app-id",
  storageBucket: "your-app.appspot.com",
  messagingSenderId: "YOUR-ID",
  appId: "YOUR-ID"
};

// ✅ Mos e inicializo dy herë
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// ✅ Krijo instancat dhe eksporto
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
