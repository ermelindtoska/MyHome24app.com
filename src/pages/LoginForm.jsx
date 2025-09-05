import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";
import { EyeIcon, EyeOffIcon } from "@heroicons/react/solid";

export default function LoginForm() {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    if (loading) return;
    setErr("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
      navigate("/"); // ose ku dëshiron pas login
    } catch (e) {
      setErr(
        e?.code === "auth/invalid-credential"
          ? (t("invalidCredentials") || "E-mail or password is incorrect.")
          : (e?.message || "Something went wrong.")
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-start md:items-center justify-center px-4 pt-10 md:pt-0">
      <Helmet><title>{t("loginTitle") || "Login"} – MyHome24App</title></Helmet>

      {/* Card container i centruar dhe me max width */}
      <div className="w-full max-w-md bg-white dark:bg-gray-800 shadow rounded p-6">
        <h1 className="text-2xl font-bold text-center mb-4">
          {t("loginTitle") || "Anmelden"}
        </h1>

        {err && <p className="text-sm text-red-500 mb-3">{err}</p>}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              {t("email") || "E-Mail"}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="mt-1 w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="you@example.com"
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              {t("password") || "Passwort"}
            </label>
            <input
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="mt-1 w-full px-3 py-2 pr-10 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => !loading && setShowPw((s) => !s)}
              className="absolute right-3 bottom-2.5 text-gray-500 dark:text-gray-300"
              aria-label="Toggle password visibility"
            >
              {showPw ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full ${loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"} text-white py-2 rounded`}
          >
            {loading ? (t("loggingIn") || "Einloggen…") : (t("login") || "Einloggen")}
          </button>
        </form>
      </div>
    </div>
  );
}
