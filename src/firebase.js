// src/firebase.js
import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import {
  initializeAppCheck,
  ReCaptchaV3Provider,
  onTokenChanged,
} from "firebase/app-check";

/* =========================
   ENV-Guard (CRA: REACT_APP_*)
========================= */
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

/* =========================
   App & Services
========================= */
export const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const auth = getAuth(app);
// E-Mails/Fehlertexte in Gerätesprache
auth.useDeviceLanguage?.();

export const db = getFirestore(app);
export const storage = getStorage(app);

/* =========================
   Persistenz (robust, inkl. Safari-Fallback)
========================= */
(async () => {
  try {
    await setPersistence(auth, browserLocalPersistence); // bevorzugt
  } catch {
    await setPersistence(auth, browserSessionPersistence); // Fallback (z. B. iOS Private Mode)
  }
})();

/* =========================
   App Check (reCAPTCHA v3)
   - Monitoring in der Console lassen, bis iPhone-Login stabil ist
   - Enforce erst später aktivieren
   Steuerung per ENV:
     REACT_APP_DISABLE_APPCHECK=1   -> komplett aus
     REACT_APP_RECAPTCHA_V3_SITE_KEY=xxxx (Pflicht für an)
========================= */
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

      // Warte kurz auf ein Token, blockiere die App aber nicht
      let resolved = false;

      onTokenChanged(appCheck, (tokenResult) => {
        if (!resolved && tokenResult) {
          resolved = true;
          resolveReady();
        }
      });

      // weiches Timeout: nach 2s „bereit“, harter Fallback nach 4s
      setTimeout(() => { if (!resolved) resolveReady(); }, 2000);
      setTimeout(() => { if (!resolved) resolveReady(); }, 4000);
    } else {
      // AppCheck aus -> sofort „bereit“
      resolveReady();
    }
  } catch (e) {
    console.warn("[AppCheck] init failed (fail-open):", e);
    resolveReady();
  }
}
