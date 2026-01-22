// src/firebase.js
import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
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
auth.useDeviceLanguage?.();

export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app, "us-central1");

/* =========================
   Persistenz (robust)
========================= */
(async () => {
  try {
    await setPersistence(auth, browserLocalPersistence);
  } catch {
    await setPersistence(auth, browserSessionPersistence);
  }
})();

/* =========================
   App Check (reCAPTCHA v3) – FAIL OPEN
   ENV:
     REACT_APP_DISABLE_APPCHECK=1
     REACT_APP_RECAPTCHA_V3_SITE_KEY=xxxx
     REACT_APP_APPCHECK_DEBUG_TOKEN=xxxx (optional)
========================= */
const DISABLE = String(process.env.REACT_APP_DISABLE_APPCHECK || "") === "1";
const SITE_KEY = String(process.env.REACT_APP_RECAPTCHA_V3_SITE_KEY || "");
const DEBUG_TOKEN = String(process.env.REACT_APP_APPCHECK_DEBUG_TOKEN || "");

export const appCheckEnabled = !DISABLE && !!SITE_KEY;

let resolveReady;
export const appCheckReady = new Promise((res) => (resolveReady = res));

const safeResolveReady = () => {
  try {
    resolveReady?.();
  } catch {}
};

if (typeof window !== "undefined") {
  try {
    if (DEBUG_TOKEN) {
      window.FIREBASE_APPCHECK_DEBUG_TOKEN = DEBUG_TOKEN;
      console.log("[AppCheck] Debug token enabled via ENV.");
    }

    if (appCheckEnabled) {
      const appCheck = initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(SITE_KEY),
        isTokenAutoRefreshEnabled: true,
      });

      let resolved = false;

      onTokenChanged(appCheck, (tokenResult) => {
        if (!resolved && tokenResult) {
          resolved = true;
          safeResolveReady();
        }
      });

      // fail-open
      setTimeout(() => {
        if (!resolved) safeResolveReady();
      }, 2500);
    } else {
      safeResolveReady();
    }
  } catch (e) {
    console.warn("[AppCheck] init failed (fail-open):", e);
    safeResolveReady();
  }
} else {
  safeResolveReady();
}
