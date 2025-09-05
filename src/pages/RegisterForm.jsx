// src/pages/RegisterForm.jsx
import React, { useState } from "react";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { setDoc, doc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";
import { EyeIcon, EyeOffIcon } from "@heroicons/react/solid";

export default function RegisterForm() {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    confirmEmail: "",
    password: "",
    confirmPassword: "",
    role: "user",
  });

  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setOk("");
    setLoading(true);

    const { firstName, lastName, email, confirmEmail, password, confirmPassword, role } = form;

    try {
      // basic validations
      if (email.trim().toLowerCase() !== confirmEmail.trim().toLowerCase()) {
        throw new Error(t("emailMismatch") || "Emails do not match.");
      }
      if (password !== confirmPassword) {
        throw new Error(t("passwordMismatch") || "Passwords do not match.");
      }

      // 1) Create user
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const user = cred.user;
      console.log("[Register] Created user:", user.uid);

      // 2) Save profile
      await setDoc(doc(db, "users", user.uid), {
        firstName,
        lastName,
        email: email.toLowerCase(),
        role,
        createdAt: serverTimestamp(),
      });

      // 3) Send verification email (explicit actionCodeSettings)
      const actionCodeSettings = {
        url: `${window.location.origin}/login?email=${encodeURIComponent(email)}`,
        handleCodeInApp: false, // email link opens directly in browser
      };

      await sendEmailVerification(user, actionCodeSettings);
      console.log("[Register] Verification email sent to:", email);

      setOk(
        t("registerSuccessMessage") ||
          "A verification link has been sent to your email address."
      );

      // 4) Go to a friendly success page
      navigate("/register-success", { replace: true, state: { email } });
    } catch (e) {
      console.error("[Register] Error:", e);
      if (e?.code === "auth/email-already-in-use") {
        setErr(t("emailInUse") || "Email is already registered.");
      } else if (e?.code === "auth/weak-password") {
        setErr(t("weakPassword") || "Password is too weak.");
      } else if (e?.code === "auth/invalid-email") {
        setErr("Invalid email address.");
      } else {
        setErr(e?.message || "Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 mt-10 bg-white dark:bg-gray-800 shadow rounded">
      <Helmet><title>Register – MyHome24App</title></Helmet>

      <h2 className="text-2xl font-bold mb-4 text-center text-gray-900 dark:text-white">
        {t("createAccount") || "Create Account"}
      </h2>

      {ok && <p className="text-green-600 mb-4 text-sm">{ok}</p>}
      {err && <p className="text-red-500 mb-4 text-sm">{err}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="firstName" placeholder={t("firstName") || "First name"} value={form.firstName} onChange={onChange} required className="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-sm" />
        <input name="lastName"  placeholder={t("lastName") || "Last name"}  value={form.lastName}  onChange={onChange} required className="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-sm" />
        <input name="email" type="email" placeholder={t("email") || "Email"} value={form.email} onChange={onChange} required className="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-sm" />
        <input name="confirmEmail" type="email" placeholder={t("confirmEmail") || "Confirm email"} value={form.confirmEmail} onChange={onChange} required className="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-sm" />

        <select name="role" value={form.role} onChange={onChange} className="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-sm">
          <option value="user">{t("roleUser") || "User"}</option>
          <option value="owner">{t("roleOwner") || "Owner"}</option>
          <option value="agent">{t("roleAgent") || "Agent"}</option>
        </select>

        <div className="relative">
          <input name="password" type={showPw ? "text" : "password"} placeholder={t("password") || "Password"} value={form.password} onChange={onChange} required className="w-full px-3 py-2 pr-10 border rounded bg-white dark:bg-gray-700 text-sm" />
          <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-2 top-2.5 text-gray-500">{showPw ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}</button>
        </div>

        <div className="relative">
          <input name="confirmPassword" type={showPw2 ? "text" : "password"} placeholder={t("confirmPassword") || "Confirm password"} value={form.confirmPassword} onChange={onChange} required className="w-full px-3 py-2 pr-10 border rounded bg-white dark:bg-gray-700 text-sm" />
          <button type="button" onClick={() => setShowPw2(!showPw2)} className="absolute right-2 top-2.5 text-gray-500">{showPw2 ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}</button>
        </div>

        <button type="submit" disabled={loading} className={`w-full ${loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"} text-white py-2 rounded`}>
          {loading ? (t("creating") || "Creating…") : (t("register") || "Register")}
        </button>
      </form>
    </div>
  );
}
