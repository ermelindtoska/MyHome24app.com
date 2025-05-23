// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyATGT5mkpKXQ89mcFuoN6LZn_LoTlEsF0k",
  authDomain: "myhome24-82875.firebaseapp.com",
  projectId: "myhome24-82875",
  storageBucket: "myhome24-82875.appspot.com",
  messagingSenderId: "697944942877",
  appId: "1:697944942877:web:a3ddefaa53196d166919f4",
  measurementId: "G-E0L6DXBETQ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);

export { auth, storage };
