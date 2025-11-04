import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { useNavigate, useLocation } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  sendEmailVerification,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  inMemoryPersistence,
} from "firebase/auth";
import { auth, appCheckReady } from "../firebase";
import { useTranslation } from "react-i18next";

/* --- kleiner Helper: Timeout-Guard --- */
function tryWithTimeout(promise, ms, label = "op") {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`timeout:${label}`)), ms)
    ),
  ]);
}

/* --- Persistenz robust setzen (iOS/Private Mode etc.) --- */
async function ensurePersistence() {
  try {
    await setPersistence(auth, browserLocalPersistence);
  } catch {
    try {
      await setPersistence(auth, browserSessionPersistence);
    } catch {
      await setPersistence(auth, inMemoryPersistence);
    }
  }
}

/* --- freundliche Fehlermeldungen --- */
function humanizeError(e, t) {
  const code = e?.code || "";
  if (String(e?.message || "").startsWith("timeout:")) {
    return "Netzwerk-Timeout. Bitte erneut versuchen.";
  }
  if (code === "auth/user-not-found" || code === "auth/wrong-password") {
    return t("wrongCredentials") || "E-Mail oder Passwort falsch.";
  }
  if (code === "auth/too-many-requests") {
    return t("tooMany") || "Zu viele Versuche. Bitte kurz warten.";
  }
  if (code.includes("appCheck/")) {
    return "App-Check konnte nicht verifiziert werden. Bitte Seite neu laden oder später erneut versuchen.";
  }
  return t("loginFailed") || "Anmeldung fehlgeschlagen. Bitte prüfen Sie Ihre Daten.";
}

export default function LoginForm() {
  const { t, i18n } = useTranslation("auth");
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const q = new URLSearchParams(location.search);
  const justVerified = q.get("verified") === "1";
  const verifyFailed = q.get("verify") === "failed";

async function onSubmit(e) {
  e.preventDefault();
  setErr("");
  setLoading(true);
  try {
    // App Check max. 1,5s warten (dann trotzdem weiter)
    await Promise.race([appCheckReady, new Promise(r => setTimeout(r, 1500))]);

    // Persistenz robust setzen (Local → Session → In-Memory)
    try {
      await setPersistence(auth, browserLocalPersistence);
    } catch {
      try { await setPersistence(auth, browserSessionPersistence); }
      catch { await setPersistence(auth, inMemoryPersistence); }
    }

    auth.languageCode = i18n?.language?.slice(0,2) || "de";

    const cred = await tryWithTimeout(
      signInWithEmailAndPassword(auth, email.trim(), pw),
      12000,
      "signIn"
    );

    // einmal reloaden, damit verified/claims aktuell sind
    try { await tryWithTimeout(cred.user.reload(), 3000, "reload"); } catch {}

    if (!cred.user.emailVerified) {
      setErr(t("pleaseVerifyFirst") || "Bitte E-Mail zuerst bestätigen. Link wurde erneut gesendet.");
      try { await sendEmailVerification(cred.user); } catch {}
      return;
    }

    // 🔒 WICHTIG: auf den nächsten Auth-State warten (Race fix)
    await new Promise(resolve => {
      const target = cred.user.uid;
      const unsub = auth.onAuthStateChanged(u => {
        if (u && u.uid === target) { unsub(); resolve(); }
      });
      // Fallback, falls das Event schon vorher kam
      setTimeout(() => { try { unsub(); } catch {} resolve(); }, 1500);
    });

    // ✅ jetzt erst navigieren
    navigate("/profile", { replace: true });
  } catch (e) {
    console.error("[login] error:", e);
    const msg = e?.code?.startsWith?.("appCheck/")
      ? "App-Check konnte nicht verifiziert werden. Seite neu laden und erneut versuchen."
      : e?.message?.startsWith?.("timeout:")
        ? "Netzwerk-Timeout. Bitte erneut versuchen."
        : (t("loginFailed") || "Anmeldung fehlgeschlagen. Bitte prüfen Sie Ihre Daten.");
    setErr(msg);
  } finally {
    setLoading(false);
  }
}


  return (
    <div className="max-w-md mx-auto p-6 mt-10 bg-white dark:bg-gray-800 shadow rounded">
      <Helmet>
        <title>{t("loginTitle") || "Anmelden – MyHome24App"}</title>
      </Helmet>

      {justVerified && (
        <p className="text-green-600 text-sm mb-3">
          {t("emailVerifiedNowLogin") || "E-Mail bestätigt. Sie können sich jetzt anmelden."}
        </p>
      )}
      {verifyFailed && (
        <p className="text-red-500 text-sm mb-3">
          {t("verifyFailed") || "E-Mail-Bestätigung fehlgeschlagen. Link ggf. abgelaufen."}
        </p>
      )}
      {err && <p className="text-red-500 text-sm mb-3">{err}</p>}

      <form onSubmit={onSubmit} className="space-y-3">
        <input
          type="email"
          placeholder={t("email") || "E-Mail"}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded"
          autoComplete="email"
        />
        <input
          type="password"
          placeholder={t("password") || "Passwort"}
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded"
          autoComplete="current-password"
        />
        <button
          type="submit"
          disabled={loading}
          className={`w-full ${loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"} text-white py-2 rounded`}
        >
          {loading ? (t("pleaseWait") || "Bitte warten…") : (t("login") || "Einloggen")}
        </button>
      </form>
    </div>
  );
}
