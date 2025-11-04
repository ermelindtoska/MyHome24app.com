// src/firebase.js
import { initializeApp, getApps } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence, browserSessionPersistence, inMemoryPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

// Lejo env të paplota vetëm në dev kur REACT_APP_ALLOW_PARTIAL_ENV=1
const ALLOW_PARTIAL_ENV =
  process.env.NODE_ENV === "development" &&
  process.env.REACT_APP_ALLOW_PARTIAL_ENV === "1";

// Env të domosdoshme për Firebase
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

// Initialize app (singleton)
export const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

// Services
export const auth = getAuth(app);
// ✅ Persistenz robust auch auf Mobile (Safari/Private Mode, Android WebView)
(async () => {
  try {
    await setPersistence(auth, browserLocalPersistence);
  } catch {
    try {
      await setPersistence(auth, browserSessionPersistence);
    } catch {
      await setPersistence(auth, inMemoryPersistence);
    }
  }
})();
export const db = getFirestore(app);
export const storage = getStorage(app);

// ✅ Mbaje login-in edhe pas refresh-it
setPersistence(auth, browserLocalPersistence).catch(() => { /* noop */ });

// -------- App Check (DEV off, PROD on vetëm kur ka key) --------
let appCheckReadyResolve;
export const appCheckReady = new Promise((res) => (appCheckReadyResolve = res));

// Prano të dy format e env-it për site key
const SITE_KEY =
  process.env.REACT_APP_FIREBASE_APPCHECK_KEY ||
  process.env.REACT_APP_RECAPTCHA_V3_SITE_KEY ||
  "";

export const appCheckEnabled = (() => {
  if (typeof window === "undefined") return false;
  const isDev = window.location.hostname === "localhost";
  const disabledFlag = String(process.env.REACT_APP_DISABLE_APPCHECK || "") === "1";
  const hasSiteKey = SITE_KEY.length > 0;
  // DEV: OFF;  PROD: ON vetëm nëse ka site key dhe s’është deaktivuar me flag
  return !isDev && !disabledFlag && hasSiteKey;
})();

if (typeof window !== "undefined") {
  try {
    if (appCheckEnabled) {
      initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(SITE_KEY),
        isTokenAutoRefreshEnabled: true,
      });
      // console.info("[AppCheck] enabled");
    } else {
      // console.info("[AppCheck] disabled (dev ose pa key)");
    }
  } catch (e) {
    console.warn("[AppCheck] init failed:", e);
  } finally {
    appCheckReadyResolve();
  }
}
