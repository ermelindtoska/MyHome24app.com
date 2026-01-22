// src/pages/LoginForm.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { useNavigate, useLocation } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  inMemoryPersistence,
  signOut,
} from "firebase/auth";
import { useTranslation } from "react-i18next";
import { auth, appCheckReady } from "../firebase";
import { useAuth } from "../context/AuthContext";

// Promise-Timeout
function withTimeout(promise, ms, label = "op") {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`timeout:${label}`)), ms)
    ),
  ]);
}

const mapAuthError = (code, t) => {
  const F = {
    "auth/invalid-email": t("invalidEmail") || "E-Mail ist ungültig.",
    "auth/user-disabled": t("userDisabled") || "Konto ist deaktiviert.",
    "auth/user-not-found": t("userNotFound") || "Benutzer wurde nicht gefunden.",
    "auth/wrong-password": t("wrongPassword") || "Passwort ist falsch.",
    "auth/too-many-requests": t("tooManyRequests") || "Zu viele Versuche. Bitte später erneut.",
    "auth/network-request-failed": t("networkFailed") || "Netzwerkfehler. Bitte erneut versuchen.",
    "auth/operation-not-supported-in-this-environment":
      t("opNotSupported") ||
      "Diese Browser-Einstellung blockiert die Anmeldung (z. B. Privatmodus/Tracking-Schutz).",
    "auth/internal-error":
      t("internalError") ||
      "Interner Browserfehler. Seite neu laden oder anderen Modus testen.",
  };
  return F[code] || t("loginFailed") || "Anmeldung fehlgeschlagen.";
};

export default function LoginForm() {
  const { t, i18n } = useTranslation("auth");
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();

  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const q = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const justVerified = q.get("verified") === "1";
  const verifyFailed = q.get("verify") === "failed";

  useEffect(() => {
    if (currentUser) navigate("/", { replace: true });
  }, [currentUser, navigate]);

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      await Promise.race([appCheckReady, new Promise((r) => setTimeout(r, 1500))]);

      auth.languageCode = i18n?.language?.slice(0, 2) || "de";

      // Persistenz: respect remember checkbox
      try {
        const ua = navigator.userAgent || "";
        const isIOS = /iP(hone|ad|od)/.test(ua);

        if (isIOS) {
          try {
            await setPersistence(auth, browserSessionPersistence);
          } catch {
            try {
              await setPersistence(auth, inMemoryPersistence);
            } catch {}
          }
        } else {
          if (remember) {
            try {
              await setPersistence(auth, browserLocalPersistence);
            } catch {
              await setPersistence(auth, browserSessionPersistence);
            }
          } else {
            await setPersistence(auth, browserSessionPersistence);
          }
        }
      } catch {}

      const cred = await withTimeout(
        signInWithEmailAndPassword(auth, email.trim(), pw),
        12000,
        "signIn"
      );

      // ✅ blloko login nëse s’është verifikuar
      if (!cred.user.emailVerified) {
        await signOut(auth);
        navigate(`/verify-needed?email=${encodeURIComponent(email.trim())}`, {
          replace: true,
        });
        return;
      }

      const qs = new URLSearchParams(location.search);
      const next = qs.get("next") || qs.get("from");
      const target =
        next && next.startsWith("/")
          ? `/auth/redirect?next=${encodeURIComponent(next)}`
          : "/auth/redirect";

      navigate(target, { replace: true });

      setTimeout(() => {
        if (window.location.pathname !== (next || "/")) {
          window.location.assign(target);
        }
      }, 120);
    } catch (e2) {
      const code = e2?.code || e2?.message || "";
      const isTimeout = String(e2?.message || "").startsWith("timeout:");
      const msg = isTimeout
        ? (t("timeout") || "Netzwerk-Timeout. Bitte erneut versuchen.")
        : mapAuthError(code, t);

      setErr(`${msg} (${code})`);
      console.error("[login] error:", e2);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 mt-10 bg-white dark:bg-gray-800 shadow rounded">
      <Helmet>
        <title>{t("loginTitle") || "Anmelden – MyHome24App"}</title>
        <meta name="description" content={t("loginMeta") || "Melden Sie sich an, um fortzufahren."} />
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

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">{t("emailLabel") || "E-Mail"}</label>
          <input
            type="email"
            placeholder={t("email") || "E-Mail"}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full px-3 py-2 border rounded bg-white dark:bg-gray-900"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">{t("passwordLabel") || "Passwort"}</label>
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              placeholder={t("password") || "Passwort"}
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              required
              autoComplete="current-password"
              className="
                w-full px-3 py-2 border rounded pr-10
                bg-white text-gray-900
                placeholder-gray-500
                caret-blue-500
                dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-400
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              "
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-300"
              aria-label={showPw ? t("hidePassword") || "Passwort verbergen" : t("showPassword") || "Passwort zeigen"}
            >
              {showPw ? "🙈" : "👁️"}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="inline-flex items-center gap-2 select-none">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4"
            />
            <span className="text-sm">{t("staySignedIn") || "Angemeldet bleiben"}</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full ${loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"} text-white py-2 rounded transition-colors`}
        >
          {loading ? t("pleaseWait") || "Bitte warten…" : t("login") || "Einloggen"}
        </button>
      </form>
    </div>
  );
}
