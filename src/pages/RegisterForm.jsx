// src/pages/RegisterForm.jsx
import React, { useState } from "react";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  reload,
} from "firebase/auth";
import { setDoc, doc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";
import { EyeIcon, EyeOffIcon } from "@heroicons/react/solid";

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

  // Try SDK first, then REST fallback
  async function fireVerificationEmail(user) {
    try {
      await sendEmailVerification(user, {
        url: `${window.location.origin}/login`,
        handleCodeInApp: false,
      });
      console.log("[Register] verification via SDK");
      return;
    } catch (e) {
      console.warn("[Register] SDK sendEmailVerification failed, fallback:", e);
    }

    const apiKey = auth.app.options.apiKey;
    const idToken = await user.getIdToken();

    const resp = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestType: "VERIFY_EMAIL", idToken }),
      }
    );

    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error(`sendOobCode REST failed: ${resp.status} ${txt}`);
    }
    console.log("[Register] verification via REST fallback");
  }

  async function handleSubmit(e) {
    e.preventDefault();

    // 🔒 avoid double-submit keeping the button stuck on "creating…"
    if (loading) return;

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

      const emailNorm = email.trim().toLowerCase();
      const confirmEmailNorm = confirmEmail.trim().toLowerCase();

      if (emailNorm !== confirmEmailNorm)
        throw new Error(t("emailMismatch") || "E-mails do not match.");
      if (password !== confirmPassword)
        throw new Error(t("passwordMismatch") || "Passwords do not match.");

      // 1) Create user
      const cred = await createUserWithEmailAndPassword(
        auth,
        emailNorm,
        password
      );
      const user = cred.user;
      console.log("[Register] signUp OK:", user.uid);

      // 2) Save profile
      await setDoc(doc(db, "users", user.uid), {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: emailNorm,
        role,
        createdAt: serverTimestamp(),
      });

      // 3) Make sure email templates use the current language
      auth.languageCode = i18n.language?.slice(0, 2) || "de";
      await reload(user);

      // 4) Send verification
      await fireVerificationEmail(user);

      // 5) Feedback + navigation
      setSuccessMessage(
        t("registerSuccessMessage") ||
          "A verification link has been sent to your email."
      );

      // If you have a “check inbox” page:
      navigate("/register-success", { replace: true, state: { email: emailNorm } });
      return; // stop further execution after navigate
    } catch (err) {
      console.error("[Register] ERROR:", err);
      if (err?.code === "auth/email-already-in-use") {
        setError(t("emailInUse") || "E-mail is already registered.");
      } else if (err?.code === "auth/weak-password") {
        setError(t("weakPassword") || "Password is too weak.");
      } else if (err?.code === "auth/too-many-requests") {
        setError(
          t("tooManyRequests") ||
            "Too many attempts. Please try again in a few minutes."
        );
      } else {
        setError(err?.message || "Something went wrong.");
      }
    } finally {
      // ✅ always release the button
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 mt-10 bg-white dark:bg-gray-800 shadow rounded">
      <Helmet>
        <title>Register – MyHome24App</title>
      </Helmet>

      <h2 className="text-2xl font-bold mb-4 text-center">
        {t("createAccount") || "Create Account"}
      </h2>

      {successMessage && (
        <p className="text-green-600 mb-4 text-sm">{successMessage}</p>
      )}
      {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="firstName"
          placeholder={t("firstName") || "First Name"}
          value={formData.firstName}
          onChange={handleChange}
          required
          disabled={loading}
          className="w-full px-3 py-2 border rounded"
        />
        <input
          name="lastName"
          placeholder={t("lastName") || "Last Name"}
          value={formData.lastName}
          onChange={handleChange}
          required
          disabled={loading}
          className="w-full px-3 py-2 border rounded"
        />
        <input
          name="email"
          type="email"
          placeholder={t("email") || "Email"}
          value={formData.email}
          onChange={handleChange}
          required
          disabled={loading}
          className="w-full px-3 py-2 border rounded"
        />
        <input
          name="confirmEmail"
          type="email"
          placeholder={t("confirmEmail") || "Confirm Email"}
          value={formData.confirmEmail}
          onChange={handleChange}
          required
          disabled={loading}
          className="w-full px-3 py-2 border rounded"
        />

        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          disabled={loading}
          className="w-full px-3 py-2 border rounded"
        >
          <option value="user">{t("roleUser") || "User"}</option>
          <option value="owner">{t("roleOwner") || "Owner"}</option>
          <option value="agent">{t("roleAgent") || "Agent"}</option>
        </select>

        <div className="relative">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder={t("password") || "Password"}
            value={formData.password}
            onChange={handleChange}
            required
            disabled={loading}
            className="w-full px-3 py-2 pr-10 border rounded"
          />
          <div
            className={`absolute right-2 top-2.5 ${
              loading ? "opacity-40 cursor-not-allowed" : "cursor-pointer"
            }`}
            onClick={() => !loading && setShowPassword((s) => !s)}
          >
            {showPassword ? (
              <EyeOffIcon className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
          </div>
        </div>

        <div className="relative">
          <input
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder={t("confirmPassword") || "Confirm Password"}
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            disabled={loading}
            className="w-full px-3 py-2 pr-10 border rounded"
          />
          <div
            className={`absolute right-2 top-2.5 ${
              loading ? "opacity-40 cursor-not-allowed" : "cursor-pointer"
            }`}
            onClick={() => !loading && setShowConfirmPassword((s) => !s)}
          >
            {showConfirmPassword ? (
              <EyeOffIcon className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          aria-busy={loading}
          className={`w-full ${
            loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
          } text-white py-2 rounded`}
        >
          {loading ? t("creating") || "Creating..." : t("register") || "Register"}
        </button>
      </form>
    </div>
  );
}
