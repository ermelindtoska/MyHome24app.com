// src/firebase.js
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBeaECyKbHTBGdq6PDBpbxWXuiTmIzlOxc",
  authDomain: "myhome24app-a0973.firebaseapp.com",
  projectId: "myhome24app-a0973",
  storageBucket: "myhome24app-a0973.appspot.com",
  messagingSenderId: "635338268249",
  appId: "1:635338268249:web:b20165baf83aedd0df01b48"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
