// src/firebase.js
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyBeaECyKbHTBGdq6PDBpbxWXuiTmIzlOxc",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "myhome24app-a0973.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "myhome24app-a0973",
  // DUHET appspot.com
  storageBucket:
    process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "myhome24app-a0973.appspot.com",
  messagingSenderId:
    process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "635338268249",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:635338268249:web:b20165baf83aedd0df01b48",
};

export const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// --- App Check (mos e blloko dev-in) ---
let appCheckReadyResolve;
export const appCheckReady = new Promise((res) => (appCheckReadyResolve = res));

if (typeof window !== "undefined") {
  const disabled = String(process.env.REACT_APP_DISABLE_APPCHECK || "") === "1";
  if (!disabled) {
    try {
      const siteKey =
        process.env.REACT_APP_RECAPTCHA_V3_SITE_KEY ||
        "6Lex5sUrAAAAALD0jRUnA6zp93uAxUfIK4s4BNTd";

      const dbg = process.env.REACT_APP_APPCHECK_DEBUG_TOKEN;
      if (dbg) {
        // eslint-disable-next-line no-undef
        self.FIREBASE_APPCHECK_DEBUG_TOKEN = dbg;
      }

      initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(siteKey),
        isTokenAutoRefreshEnabled: true,
      });
    } catch (e) {
      console.warn("[AppCheck] init failed (continue without):", e);
    }
  } else {
    console.info("[AppCheck] disabled via .env");
  }
  appCheckReadyResolve();
}

// (opsionale) verifiko konfigurimin në dev
if (process.env.NODE_ENV === "development") {
  // eslint-disable-next-line no-console
  console.table(firebaseConfig);
}

