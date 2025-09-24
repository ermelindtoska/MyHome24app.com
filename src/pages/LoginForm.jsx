import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { useNavigate, useLocation } from "react-router-dom";
import { signInWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { auth, appCheckReady } from "../firebase";
import { useTranslation } from "react-i18next";

function tryWithTimeout(promise, ms, label = "op") {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`timeout:${label}`)), ms)
    ),
  ]);
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
      // Prit AppCheck max 1.5s (ose vazhdo)
      await Promise.race([appCheckReady, new Promise((r) => setTimeout(r, 1500))]);

      auth.languageCode = i18n?.language?.slice(0, 2) || "de";

      const cred = await tryWithTimeout(
        signInWithEmailAndPassword(auth, email.trim(), pw),
        12000,
        "signIn"
      );

      try { await tryWithTimeout(cred.user.reload(), 3000, "reload"); } catch {}

      if (!cred.user.emailVerified) {
        setErr(
          t("pleaseVerifyFirst") ||
            "Bitte bestätigen Sie zuerst Ihre E-Mail. Wir haben den Link erneut gesendet."
        );
        try { await sendEmailVerification(cred.user); } catch {}
        return;
      }

      // Ke /profile në App.jsx – shko aty
      navigate("/profile", { replace: true });
    } catch (e) {
      console.error("[login] error:", e);
      const msg = e?.message?.startsWith?.("timeout:")
        ? "Netzwerk-Timeout. Bitte versuchen Sie es erneut."
        : (t("loginFailed") || "Anmeldung fehlgeschlagen. Bitte prüfen Sie Ihre Daten.");
      setErr(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 mt-10 bg-white dark:bg-gray-800 shadow rounded">
      <Helmet>
        <title>{t("loginTitle") || "Anmelden – MyHome24app"}</title>
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
        />
        <input
          type="password"
          placeholder={t("password") || "Passwort"}
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded"
        />
        <button
          type="submit"
          disabled={loading}
          className={`w-full ${
            loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
          } text-white py-2 rounded`}
        >
          {loading ? (t("pleaseWait") || "Bitte warten…") : (t("login") || "Einloggen")}
        </button>
      </form>
    </div>
  );
}
