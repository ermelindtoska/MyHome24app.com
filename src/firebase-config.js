// src/firebase-config.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBVX2kncipl29h4mN1vpjpymMcJdU0JhPc",
  authDomain: "myhome24app.firebaseapp.com",
  projectId: "myhome24app",
  storageBucket: "myhome24app.appspot.com",
  messagingSenderId: "774372834389",
  appId: "1:774372834389:web:bf13f1f1d824b713eba8dc"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
