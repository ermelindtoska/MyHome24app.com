import React, { useState } from "react";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { auth } from "../firebase";
import { useTranslation } from "react-i18next";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";

const mapAuthError = (code, t) => {
  const errors = {
    "auth/invalid-email":
      t("invalidEmail") || "Die E-Mail-Adresse ist ungültig.",
    "auth/user-disabled":
      t("userDisabled") || "Dieses Konto wurde deaktiviert.",
    "auth/user-not-found":
      t("userNotFound") || "Benutzer:in wurde nicht gefunden.",
    "auth/wrong-password":
      t("wrongPassword") || "Das Passwort ist falsch.",
    "auth/invalid-credential":
      t("invalidCredentials") || "Ungültige E-Mail oder falsches Passwort.",
    "auth/too-many-requests":
      t("tooManyRequests") || "Zu viele Versuche. Bitte später erneut.",
    "auth/network-request-failed":
      t("networkFailed") || "Netzwerkfehler. Bitte erneut versuchen.",
  };

  return errors[code] || t("loginError") || "Anmeldung fehlgeschlagen.";
};

const LoginPage = () => {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [remember] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const email = formData.email.trim();
    const password = formData.password;

    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);

      if (!cred.user.emailVerified) {
        await signOut(auth);
        navigate(`/verify-needed?email=${encodeURIComponent(email)}`, {
          replace: true,
        });
        return;
      }

      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error("[LoginPage] login error:", err);
      setError(mapAuthError(err.code, t));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-10">
      <Helmet>
        <title>{t("loginTitle") || "Anmelden"} – MyHome24App</title>
        <meta
          name="description"
          content={
            t("loginMeta") || "Melden Sie sich an, um fortzufahren."
          }
        />
      </Helmet>

      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/90">
        <div className="mb-6 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
            {t("loginTitle") || "Anmelden"}
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            {t("pleaseLogin") || "Bitte melden Sie sich an, um fortzufahren."}
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
              {t("emailLabel") || "E-Mail"}
            </label>
            <input
              name="email"
              type="email"
              placeholder={t("emailPlaceholder") || "E-Mail"}
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
              {t("passwordLabel") || "Passwort"}
            </label>

            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder={t("passwordPlaceholder") || "Passwort"}
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-2.5 pr-11 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-300 hover:text-slate-700 dark:hover:text-white"
                aria-label={
                  showPassword
                    ? t("hidePassword") || "Passwort verbergen"
                    : t("showPassword") || "Passwort zeigen"
                }
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm gap-3">
            <label className="flex items-center text-slate-600 dark:text-slate-300">
              <input
                type="checkbox"
                checked={remember}
                readOnly
                className="mr-2 h-4 w-4 rounded border-slate-300 dark:border-slate-700"
              />
              {t("stayLoggedIn") || t("staySignedIn") || "Angemeldet bleiben"}
            </label>

            <Link
              to="/forgot-password"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              {t("forgotPassword") || "Passwort vergessen?"}
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full rounded-xl py-2.5 font-semibold text-white transition ${
              loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading
              ? t("pleaseWait") || "Bitte warten…"
              : t("loginButton") || "Einloggen"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-700 dark:text-slate-300">
          {t("noAccount") || "Noch kein Konto?"}{" "}
          <Link
            to="/register"
            className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            {t("registerNow") || t("registerHere") || "Jetzt registrieren"}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;