// src/pages/VerifyNeeded.jsx
import React, { useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";

import { auth, appCheckReady } from "../firebase";

export default function VerifyNeeded() {
  const { t, i18n } = useTranslation("auth");
  const navigate = useNavigate();
  const location = useLocation();

  const query = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const emailFromUrl = (query.get("email") || "").trim().toLowerCase();

  const [email] = useState(emailFromUrl);
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const lang2 = useMemo(() => (i18n?.language || "de").slice(0, 2), [i18n?.language]);

  // ✅ handler page (duhet të jetë në Firebase Authorized domains)
  const CONTINUE_URL = "https://www.myhome24app.com/auth/action";

  // ✅ HTTP endpoint (nga deploy output)
  const VERIFY_FN_URL = "https://sendverificationemaildirectv2-om4vattvlq-uc.a.run.app";

  const redirectBackToLogin = async () => {
    try {
      await signOut(auth);
    } catch {}
    setTimeout(() => navigate("/login", { replace: true }), 1200);
  };

  const handleResend = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);

    try {
      if (!email) throw new Error(t("emailRequired"));

      // 1) AppCheck gati
      await appCheckReady;

      auth.languageCode = lang2;

      let user = auth.currentUser;

      // 2) Nëse s’je logged-in me atë email, kërko password dhe hyr
      if (!user || (user?.email || "").toLowerCase() !== email) {
        if (!password) throw new Error(t("passwordRequired"));
        const cred = await signInWithEmailAndPassword(auth, email, password);
        user = cred.user;
      }

      // 3) Nëse user është verifikuar tashmë
      if (user?.emailVerified) {
        setSuccessMessage(t("alreadyVerified"));
        await redirectBackToLogin();
        return;
      }

      // 4) Merr ID token
      const idToken = await user.getIdToken(true);

      // 5) Thirr HTTP function me Bearer token
      const resp = await fetch(VERIFY_FN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          continueUrl: CONTINUE_URL,
          locale: lang2,
        }),
      });

      const data = await resp.json().catch(() => ({}));
      console.log("[VerifyNeeded] verify response:", resp.status, data);

      if (!resp.ok) {
        const msg = data?.message || data?.error || `HTTP ${resp.status}`;
        throw new Error(msg);
      }

      if (data?.alreadyVerified) {
        setSuccessMessage(t("alreadyVerified"));
        await redirectBackToLogin();
        return;
      }

      setSuccessMessage(t("verifyEmailResent"));
      await redirectBackToLogin();
    } catch (err) {
      console.error("[VerifyNeeded] resend FAILED:", err);
      setError(err?.message || t("somethingWrong"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 mt-10 bg-white dark:bg-gray-800 shadow rounded transition-colors duration-300">
      <Helmet>
        <title>{t("verifyNeededTitle")}</title>
      </Helmet>

      <h2 className="text-2xl font-bold mb-2 text-center text-gray-900 dark:text-white">
        {t("verifyNeededTitle")}
      </h2>

      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
        {t("verifyNeededHint")}
      </p>

      {successMessage && (
        <p className="text-green-600 dark:text-green-400 mb-3 text-sm">
          {successMessage}
        </p>
      )}
      {error && <p className="text-red-600 dark:text-red-400 mb-3 text-sm">{error}</p>}

      <form onSubmit={handleResend} className="space-y-3">
        <div>
          <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">
            {t("email")}
          </label>
          <input
            value={email}
            readOnly
            className="w-full px-3 py-2 border rounded bg-gray-100 dark:bg-gray-700 dark:border-gray-600 text-sm text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">
            {t("password")}
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t("password")}
            autoComplete="current-password"
            className="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 dark:border-gray-600 text-sm text-gray-900 dark:text-white"
          />
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
            {t("passwordResendHint")}
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full ${
            loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
          } text-white py-2 rounded transition`}
        >
          {loading ? t("sending") : t("resendVerification")}
        </button>

        <button
          type="button"
          onClick={() => navigate("/login")}
          className="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white py-2 rounded transition"
        >
          {t("backToLogin")}
        </button>
      </form>
    </div>
  );
}