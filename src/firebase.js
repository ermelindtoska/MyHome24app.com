// src/firebase.js
import { initializeApp, getApps } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import {  initializeAppCheck,  ReCaptchaV3Provider,  onTokenChanged,} from "firebase/app-check";

// ==== ENV-Guard (ohne Hardcode-Fallbacks) ====
const REQUIRED = [
  "REACT_APP_FIREBASE_API_KEY",
  "REACT_APP_FIREBASE_AUTH_DOMAIN",
  "REACT_APP_FIREBASE_PROJECT_ID",
  "REACT_APP_FIREBASE_STORAGE_BUCKET",
  "REACT_APP_FIREBASE_MESSAGING_SENDER_ID",
  "REACT_APP_FIREBASE_APP_ID",
];
REQUIRED.forEach((k) => {
  if (!process.env[k]) throw new Error(`Missing env var: ${k}`);
});

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

export const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Optional: Default-Persistenz (eingeloggt bleiben)
setPersistence(auth, browserLocalPersistence).catch(() => {});

// ==== App Check: per Flags steuerbar ====
// DEV: Schalte aus mit REACT_APP_DISABLE_APPCHECK=1
// PROD: Nutze REACT_APP_RECAPTCHA_V3_SITE_KEY
const DISABLE = String(process.env.REACT_APP_DISABLE_APPCHECK || "") === "1";
const SITE_KEY = String(process.env.REACT_APP_RECAPTCHA_V3_SITE_KEY || "");
export const appCheckEnabled = !DISABLE && !!SITE_KEY;

let resolveReady;
export const appCheckReady = new Promise((res) => (resolveReady = res));

if (typeof window !== "undefined") {
  try {
    if (appCheckEnabled) {
      const appCheck = initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(SITE_KEY),
        isTokenAutoRefreshEnabled: true,
      });
      // Notfalls nach 2s „ready“, damit UI nie hängt
      setTimeout(() => resolveReady(), 2000);
            // ✅ WIRKLICH auf einen gültigen Token warten:
      let resolved = false;
      onTokenChanged(appCheck, (tokenResult) => {
        if (!resolved && tokenResult) {
          resolved = true;
          resolveReady();
        }
      });
      // Fallback, falls onTokenChanged nicht feuert (z. B. Adblocker)
      setTimeout(() => {
        if (!resolved) resolveReady();
      }, 4000);
    } else {
      resolveReady();
    }
  } catch (e) {
    console.warn("[AppCheck] init failed:", e);
    resolveReady();
  }
}
