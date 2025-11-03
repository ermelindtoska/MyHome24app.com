// src/firebase.js
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";


// (opsionale) lejo mjedise dev-tool pa env të plota:
const ALLOW_PARTIAL_ENV =
  process.env.NODE_ENV === "development" &&
  process.env.REACT_APP_ALLOW_PARTIAL_ENV === "1";

// 🔐 require envs to exist (no hard-coded fallbacks)
const required = [
  "REACT_APP_FIREBASE_API_KEY",
  "REACT_APP_FIREBASE_AUTH_DOMAIN",
  "REACT_APP_FIREBASE_PROJECT_ID",
  "REACT_APP_FIREBASE_STORAGE_BUCKET",
  "REACT_APP_FIREBASE_MESSAGING_SENDER_ID",
  "REACT_APP_FIREBASE_APP_ID",
];
required.forEach((k) => {
  if (!process.env[k] && !ALLOW_PARTIAL_ENV) {
    throw new Error(`Missing env var: ${k}`);
  }
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

// --- App Check (smart si Zillow: DEV=OFF, PROD=ON vetem nese ke site key) ---
let appCheckReadyResolve;
export const appCheckReady = new Promise((res) => (appCheckReadyResolve = res));

export const appCheckEnabled = (() => {
  if (typeof window === "undefined") return false;
  const isDev = window.location.hostname === "localhost";
  const disabledFlag = String(process.env.REACT_APP_DISABLE_APPCHECK || "") === "1";
  const hasSiteKey = !!process.env.REACT_APP_RECAPTCHA_V3_SITE_KEY;
  // DEV: OFF (ose nese ke vendosur flag-un)
  // PROD: ON vetem nese ka site key dhe s’eshte deaktivuar me flag
  return !isDev && !disabledFlag && hasSiteKey;
})();

if (typeof window !== "undefined") {
  try {
    if (appCheckEnabled) {
      initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(process.env.REACT_APP_RECAPTCHA_V3_SITE_KEY),
        isTokenAutoRefreshEnabled: true,
      });
    }
  } catch (e) {
    console.warn("[AppCheck] init failed:", e);
  } finally {
    appCheckReadyResolve();
  }
}
