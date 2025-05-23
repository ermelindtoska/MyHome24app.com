// src/firebase-config.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBVX2kncipl29h4mN1vpjpymMcJdU0JhPc",
  authDomain: "myhome24app.firebaseapp.com",
  projectId: "myhome24app",
  storageBucket: "myhome24app.appspot.com",  // 🛠️ RREGULLUAR
  messagingSenderId: "774372834389",
  appId: "1:774372834389:web:bf13f1f1d824b713eba8dc"
  // measurementId mund të hiqet nëse nuk përdor Analytics tani
};

// Inicializim i Firebase dhe eksportimi i auth
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
