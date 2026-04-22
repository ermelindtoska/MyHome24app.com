// src/pages/RegisterForm.jsx
import React, { useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
} from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";

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

  const lang2 = useMemo(
    () => (i18n?.language || "de").slice(0, 2),
    [i18n?.language]
  );

  // ✅ vetëm për më vonë (kur të punojë email-i). Tani e testojmë pa këtë.
  // const ACTION_URL = "https://www.myhome24app.com/auth/action";

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

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

      const emailA = (email || "").trim().toLowerCase();
      const emailB = (confirmEmail || "").trim().toLowerCase();

      if (!emailA || !emailB) {
        throw new Error(t("emailRequired") || "Bitte E-Mail eingeben.");
      }
      if (emailA !== emailB) {
        throw new Error(t("emailMismatch") || "E-Mails stimmen nicht überein.");
      }
      if (!password) {
        throw new Error(t("passwordRequired") || "Bitte Passwort eingeben.");
      }
      if (password !== confirmPassword) {
        throw new Error(
          t("passwordMismatch") || "Passwörter stimmen nicht überein."
        );
      }

      // ✅ AppCheck: fail-open (siç e ke kërkuar)
      await Promise.race([appCheckReady, new Promise((r) => setTimeout(r, 1500))]);

      // ✅ Language for Firebase Auth templates
      auth.languageCode = lang2;

      // 1) Create user
      const cred = await createUserWithEmailAndPassword(auth, emailA, password);
      const user = cred.user;

      // 2) ✅ TEST MODE: dërgo verifikim pa Action URL (për të provuar që email-i vjen fare)
      await sendEmailVerification(user);

      // 3) Save profile in Firestore (best effort)
      try {
        await setDoc(doc(db, "users", user.uid), {
          firstName: (firstName || "").trim(),
          lastName: (lastName || "").trim(),
          email: emailA,
          role,
          createdAt: serverTimestamp(),
          emailVerified: false,
        });
      } catch (w) {
        console.warn("[Register] setDoc warning:", w);
      }

      // 4) Sign out (mos e lër user-in “half logged in”)
      await signOut(auth);

      setSuccessMessage(
        t("verifyEmailSent") ||
          "Wir haben Ihnen eine Bestätigungs-E-Mail gesendet. Bitte prüfen Sie auch den Spam-Ordner."
      );

      // ✅ gjithmonë shko te verify-needed
      navigate(`/verify-needed?email=${encodeURIComponent(emailA)}`, {
        replace: true,
      });
    } catch (err) {
      console.error("[Register] ERROR:", err);

      let msg =
        err?.message || (t("somethingWrong") || "Etwas ist schiefgelaufen.");

      if (err?.code === "auth/email-already-in-use")
        msg = t("emailInUse") || "E-Mail ist bereits registriert.";
      else if (err?.code === "auth/weak-password")
        msg = t("weakPassword") || "Passwort ist zu schwach (min. 6 Zeichen).";
      else if (err?.code === "auth/network-request-failed")
        msg = t("networkFailed") || "Netzwerkfehler. Bitte erneut versuchen.";
      else if (err?.code)
        msg = `${msg} (${err.code})`;

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
        <p className="text-green-600 dark:text-green-400 mb-4 text-sm">
          {successMessage}
        </p>
      )}
      {error && (
        <p className="text-red-600 dark:text-red-400 mb-4 text-sm">{error}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          name="firstName"
          placeholder={t("firstName") || "Vorname"}
          value={formData.firstName}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 dark:border-gray-600 text-sm text-gray-900 dark:text-white"
        />

        <input
          name="lastName"
          placeholder={t("lastName") || "Nachname"}
          value={formData.lastName}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 dark:border-gray-600 text-sm text-gray-900 dark:text-white"
        />

        <input
          name="email"
          type="email"
          autoComplete="email"
          placeholder={t("email") || "E-Mail"}
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 dark:border-gray-600 text-sm text-gray-900 dark:text-white"
        />

        <input
          name="confirmEmail"
          type="email"
          autoComplete="email"
          placeholder={t("confirmEmail") || "E-Mail bestätigen"}
          value={formData.confirmEmail}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 dark:border-gray-600 text-sm text-gray-900 dark:text-white"
        />

        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 dark:border-gray-600 text-sm text-gray-900 dark:text-white"
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
            className="w-full px-3 py-2 pr-10 border rounded bg-white dark:bg-gray-700 dark:border-gray-600 text-sm text-gray-900 dark:text-white"
          />
          <button
            type="button"
            aria-label="toggle password"
            className="absolute right-2 top-2.5 text-gray-500 dark:text-gray-300"
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
            className="w-full px-3 py-2 pr-10 border rounded bg-white dark:bg-gray-700 dark:border-gray-600 text-sm text-gray-900 dark:text-white"
          />
          <button
            type="button"
            aria-label="toggle confirm"
            className="absolute right-2 top-2.5 text-gray-500 dark:text-gray-300"
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
          } text-white py-2 rounded transition`}
        >
          {loading ? t("creating") || "Wird erstellt…" : t("register") || "Registrieren"}
        </button>
      </form>
    </div>
  );
}
