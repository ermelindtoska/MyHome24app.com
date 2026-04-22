// src/pages/ForgotPassword.jsx
import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";
import { FaEnvelope, FaArrowLeft } from "react-icons/fa";
import { Link } from "react-router-dom";
import { auth } from "../firebase";

const ForgotPassword = () => {
  const { t, i18n } = useTranslation("auth");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const lang = i18n.language?.slice(0, 2) || "de";

  const handleReset = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!email.trim()) {
      setError(
        t("emailRequired") || "Bitte geben Sie eine E-Mail-Adresse ein."
      );
      return;
    }

    try {
      setLoading(true);

      await sendPasswordResetEmail(auth, email.trim());

      setMessage(
        t("resetEmailSent") ||
          "Eine E-Mail zum Zurücksetzen des Passworts wurde gesendet."
      );
      setEmail("");
    } catch (err) {
      if (err.code === "auth/user-not-found") {
        setError(t("userNotFound") || "Benutzer wurde nicht gefunden.");
      } else if (err.code === "auth/invalid-email") {
        setError(t("invalidEmail") || "Ungültige E-Mail-Adresse.");
      } else if (err.code === "auth/too-many-requests") {
        setError(
          t("tooManyRequests") ||
            "Zu viele Versuche. Bitte später erneut."
        );
      } else {
        setError(
          t("resetFailed") || "Passwort-Zurücksetzen fehlgeschlagen."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <Helmet>
        <html lang={lang} />
        <title>
          {t("forgotPasswordTitle") || "Passwort zurücksetzen"} – MyHome24App
        </title>
        <meta
          name="description"
          content={
            t("resetInstruction") ||
            "Passwort zurücksetzen für MyHome24App"
          }
        />
      </Helmet>

      <div className="max-w-6xl mx-auto px-4 py-10 md:py-16">
        <div className="max-w-md mx-auto">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white mb-6 transition"
          >
            <FaArrowLeft className="text-xs" />
            {t("backToLogin") || "Zurück zur Anmeldung"}
          </Link>

          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/80 overflow-hidden">
            <div className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="h-12 w-12 rounded-2xl bg-blue-600/10 border border-blue-600/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <FaEnvelope className="text-lg" />
                </div>

                <div>
                  <h1 className="text-2xl md:text-3xl font-bold">
                    {t("forgotPassword") || "Passwort vergessen"}
                  </h1>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                    {t("resetInstruction") ||
                      "Geben Sie Ihre E-Mail-Adresse ein, um einen Link zum Zurücksetzen des Passworts zu erhalten."}
                  </p>
                </div>
              </div>

              {message && (
                <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
                  {message}
                </div>
              )}

              {error && (
                <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
                  {error}
                </div>
              )}

              <form onSubmit={handleReset} className="space-y-5">
                <div>
                  <label className="block mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                    {t("emailLabel") || t("email") || "E-Mail"}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    placeholder={t("emailPlaceholder") || "E-Mail"}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-100 dark:placeholder-slate-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed transition"
                >
                  {loading
                    ? t("sending") || "Senden…"
                    : t("sendResetLink") || "Zurücksetzen-Link senden"}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {t("haveAccount") || "Bereits ein Konto?"}{" "}
                  <Link
                    to="/login"
                    className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    {t("loginHere") || "Hier einloggen"}
                  </Link>
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
            © {new Date().getFullYear()} MyHome24App
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;