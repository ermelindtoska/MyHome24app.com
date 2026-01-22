// src/pages/RegisterForm.jsx
import React, { useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
} from "firebase/auth";
import { setDoc, doc, serverTimestamp } from "firebase/firestore";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { auth, db, appCheckReady } from "../firebase";

export default function RegisterForm() {
  const { t, i18n } = useTranslation("auth");
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    confirmEmail: "",
    password: "",
    confirmPassword: "",
    role: "user",
  });

  const handleChange = (e) =>
    setFormData((s) => ({ ...s, [e.target.name]: e.target.value }));

  // ✅ Stabile Continue-URL (fix für auth/invalid-continue-uri)
  // Du kannst das später per ENV überschreiben, wenn du willst:
  // REACT_APP_AUTH_CONTINUE_URL=https://www.myhome24app.com/auth/action
  const CONTINUE_URL = useMemo(() => {
    const envUrl = (process.env.REACT_APP_AUTH_CONTINUE_URL || "").trim();
    if (envUrl) return envUrl;

    // ✅ bewusst NICHT window.location.origin (das triggert bei dir 400 / invalid-continue-uri)
    return "https://www.myhome24app.com/auth/action";
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);

    try {
      const {
        firstName,
        lastName,
        email,
        confirmEmail,
        password,
        confirmPassword,
        role,
      } = formData;

      const emailA = email.trim().toLowerCase();
      const emailB = confirmEmail.trim().toLowerCase();

      if (emailA !== emailB) {
        throw new Error(t("emailMismatch") || "E-Mails stimmen nicht überein.");
      }
      if (password !== confirmPassword) {
        throw new Error(
          t("passwordMismatch") || "Passwörter stimmen nicht überein."
        );
      }

      // ✅ AppCheck fail-open (wie bei dir)
      await Promise.race([
        appCheckReady,
        new Promise((r) => setTimeout(r, 1500)),
      ]);

      // ✅ Sprache für Firebase Auth Templates
      auth.languageCode = i18n?.language?.slice(0, 2) || "de";

      // 1) User erstellen
      const cred = await createUserWithEmailAndPassword(auth, emailA, password);
      const user = cred.user;

      // 2) Verifizierungs-Mail senden (mit stabiler Continue-URL)
      // handleCodeInApp=true nur, wenn du /auth/action in deiner App behandelst.
      // Falls du das NICHT hast, setz es auf false.
      await sendEmailVerification(user, {
        url: CONTINUE_URL,
        handleCodeInApp: true,
      });

      // 3) Firestore Profil speichern (best effort)
      try {
        await setDoc(doc(db, "users", user.uid), {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: emailA,
          role,
          createdAt: serverTimestamp(),
          emailVerified: false,
        });
      } catch (w) {
        // best effort
        console.warn("[Register] setDoc warning:", w);
      }

      // 4) Logout (optional, aber bei dir sinnvoll)
      await signOut(auth);

      setSuccessMessage(
        t("verifyEmailSent") ||
          "Wir haben Ihnen eine Bestätigungs-E-Mail gesendet. Bitte prüfen Sie auch den Spam-Ordner."
      );

      navigate(`/verify-needed?email=${encodeURIComponent(emailA)}`, {
        replace: true,
      });
    } catch (err) {
      console.error("[Register] ERROR:", err);

      // Default msg
      let msg =
        err?.message || (t("somethingWrong") || "Etwas ist schiefgelaufen.");

      // Firebase codes
      if (err?.code === "auth/email-already-in-use")
        msg = t("emailInUse") || "E-Mail ist bereits registriert.";
      else if (err?.code === "auth/weak-password")
        msg = t("weakPassword") || "Passwort ist zu schwach (min. 6 Zeichen).";
      else if (err?.code === "auth/network-request-failed")
        msg = t("networkFailed") || "Netzwerkfehler. Bitte erneut versuchen.";
      else if (
        err?.code === "auth/invalid-continue-uri" ||
        err?.code === "auth/unauthorized-continue-uri"
      ) {
        msg =
          t("invalidContinueUrl") ||
          "Die Bestätigungs-URL ist nicht autorisiert. Bitte prüfe Firebase Auth → Einstellungen → Autorisierte Domains (localhost / myhome24app.com / www.myhome24app.com) und verwende eine gültige Continue-URL.";
      } else if (err?.code === "auth/too-many-requests") {
        msg =
          t("tooManyRequests") ||
          "Zu viele Versuche. Bitte warte kurz (ein paar Minuten) und versuche es erneut.";
      }

      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 mt-10 bg-white dark:bg-gray-800 shadow rounded transition-colors duration-300">
      <Helmet>
        <title>{t("registerTitle") || "Registrieren – MyHome24App"}</title>
      </Helmet>

      <h2 className="text-2xl font-bold mb-2 text-center text-gray-900 dark:text-white">
        {t("createAccount") || "Konto erstellen"}
      </h2>

      {successMessage && (
        <p className="text-green-600 mb-4 text-sm">{successMessage}</p>
      )}
      {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          name="firstName"
          placeholder={t("firstName") || "Vorname"}
          value={formData.firstName}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white"
        />

        <input
          name="lastName"
          placeholder={t("lastName") || "Nachname"}
          value={formData.lastName}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white"
        />

        <input
          name="email"
          type="email"
          autoComplete="email"
          placeholder={t("email") || "E-Mail"}
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white"
        />

        <input
          name="confirmEmail"
          type="email"
          autoComplete="email"
          placeholder={t("confirmEmail") || "E-Mail bestätigen"}
          value={formData.confirmEmail}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white"
        />

        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white"
        >
          <option value="user">{t("roleUser") || "Benutzer:in"}</option>
          <option value="owner">{t("roleOwner") || "Eigentümer:in"}</option>
          <option value="agent">{t("roleAgent") || "Makler:in"}</option>
        </select>

        <div className="relative">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder={t("password") || "Passwort"}
            value={formData.password}
            onChange={handleChange}
            required
            autoComplete="new-password"
            className="w-full px-3 py-2 pr-10 border rounded bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white"
          />
          <button
            type="button"
            aria-label="toggle password"
            className="absolute right-2 top-2.5 text-gray-500"
            onClick={() => setShowPassword((s) => !s)}
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>

        <div className="relative">
          <input
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder={t("confirmPassword") || "Passwort bestätigen"}
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            autoComplete="new-password"
            className="w-full px-3 py-2 pr-10 border rounded bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white"
          />
          <button
            type="button"
            aria-label="toggle confirm"
            className="absolute right-2 top-2.5 text-gray-500"
            onClick={() => setShowConfirmPassword((s) => !s)}
          >
            {showConfirmPassword ? "🙈" : "👁️"}
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full ${
            loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
          } text-white py-2 rounded`}
        >
          {loading
            ? t("creating") || "Wird erstellt…"
            : t("register") || "Registrieren"}
        </button>
      </form>
    </div>
  );
}
