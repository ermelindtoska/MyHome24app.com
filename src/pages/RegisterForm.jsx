// src/pages/RegisterForm.jsx
import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { EyeIcon, EyeOffIcon } from "@heroicons/react/solid";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useTranslation } from "react-i18next";

const RegisterForm = () => {
  const { t, i18n } = useTranslation("auth");

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);

    try {
      const {
        firstName, lastName, email, confirmEmail,
        password, confirmPassword, role,
      } = formData;

      if (email.trim().toLowerCase() !== confirmEmail.trim().toLowerCase()) {
        throw new Error(t("emailMismatch") || "E-Mails stimmen nicht überein.");
      }
      if (password !== confirmPassword) {
        throw new Error(t("passwordMismatch") || "Passwörter stimmen nicht überein.");
      }

      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const user = cred.user;

      // Gjuhë për e-mail templates
      auth.languageCode = i18n.language?.slice(0, 2) || "de";

      // Dërgo verifikimin përmes REST
      const apiKey =
        (auth?.app?.options && auth.app.options.apiKey) ||
        import.meta.env.VITE_FIREBASE_API_KEY || process.env.REACT_APP_FIREBASE_API_KEY;

      if (!apiKey) throw new Error("Missing Firebase API key.");

      const idToken = await user.getIdToken(true);
      const resp = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            requestType: "VERIFY_EMAIL",
            idToken,
            continueUrl: `${window.location.origin}/login`,
          }),
        }
      );
      if (!resp.ok) {
        const txt = await resp.text();
        throw new Error(`sendOobCode failed: ${resp.status} ${txt}`);
      }

      // Ruaj profilin (best-effort)
      try {
        await setDoc(doc(db, "users", user.uid), {
          firstName,
          lastName,
          email,
          role,
          createdAt: serverTimestamp(),
        });
      } catch (w) {
        console.warn("[Register] setDoc warning:", w);
      }

      setSuccessMessage(
        t("verifyEmailSent") ||
          "Wir haben Ihnen eine Bestätigungs-E-Mail gesendet. Bitte prüfen Sie auch den Spam-Ordner."
      );
    } catch (err) {
      console.error("[Register] ERROR:", err);
      let msg = err?.message || (t("somethingWrong") || "Etwas ist schiefgelaufen.");
      if (err?.code === "auth/email-already-in-use")
        msg = t("emailInUse") || "E-Mail ist bereits registriert.";
      else if (err?.code === "auth/weak-password")
        msg = t("weakPassword") || "Passwort ist zu schwach (min. 6 Zeichen).";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 mt-10 bg-white dark:bg-gray-800 shadow rounded transition-colors duration-300">
      <Helmet><title>{t("registerTitle") || "Registrieren – MyHome24app"}</title></Helmet>

      <h2 className="text-2xl font-bold mb-2 text-center text-gray-900 dark:text-white">
        {t("createAccount") || "Konto erstellen"}
      </h2>

      {successMessage && <p className="text-green-600 mb-4 text-sm">{successMessage}</p>}
      {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-3">
        <input name="firstName" placeholder={t("firstName") || "Vorname"}
               value={formData.firstName} onChange={handleChange} required
               className="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-sm" />
        <input name="lastName" placeholder={t("lastName") || "Nachname"}
               value={formData.lastName} onChange={handleChange} required
               className="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-sm" />
        <input name="email" type="email" autoComplete="email"
               placeholder={t("email") || "E-Mail"}
               value={formData.email} onChange={handleChange} required
               className="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-sm" />
        <input name="confirmEmail" type="email" autoComplete="email"
               placeholder={t("confirmEmail") || "E-Mail bestätigen"}
               value={formData.confirmEmail} onChange={handleChange} required
               className="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-sm" />

        <select name="role" value={formData.role} onChange={handleChange}
                className="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-sm">
          <option value="user">{t("roleUser") || "Benutzer:in"}</option>
          <option value="owner">{t("roleOwner") || "Eigentümer:in"}</option>
          <option value="agent">{t("roleAgent") || "Makler:in"}</option>
        </select>

        <div className="relative">
          <input name="password" type={showPassword ? "text" : "password"}
                 placeholder={t("password") || "Passwort"}
                 value={formData.password} onChange={handleChange} required
                 className="w-full px-3 py-2 pr-10 border rounded bg-white dark:bg-gray-700 text-sm" />
          <button type="button" aria-label="toggle password"
                  className="absolute right-2 top-2.5 text-gray-500"
                  onClick={() => setShowPassword((s) => !s)}>
            {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
          </button>
        </div>

        <div className="relative">
          <input name="confirmPassword" type={showConfirmPassword ? "text" : "password"}
                 placeholder={t("confirmPassword") || "Passwort bestätigen"}
                 value={formData.confirmPassword} onChange={handleChange} required
                 className="w-full px-3 py-2 pr-10 border rounded bg-white dark:bg-gray-700 text-sm" />
          <button type="button" aria-label="toggle confirm"
                  className="absolute right-2 top-2.5 text-gray-500"
                  onClick={() => setShowConfirmPassword((s) => !s)}>
            {showConfirmPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
          </button>
        </div>

        <button type="submit" disabled={loading}
                className={`w-full ${loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"} text-white py-2 rounded`}>
          {loading ? (t("creating") || "Wird erstellt…") : (t("register") || "Registrieren")}
        </button>
      </form>
    </div>
  );
};

export default RegisterForm;
