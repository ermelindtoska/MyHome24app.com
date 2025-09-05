import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { sendEmailVerification } from "firebase/auth";
import { auth } from "../firebase";

export default function RegisterSuccess() {
  const { state } = useLocation();
  const email = state?.email;
  const [msg, setMsg] = useState("");

  async function resend() {
    try {
      if (!auth.currentUser) return;
      await sendEmailVerification(auth.currentUser, {
        url: `${window.location.origin}/login`,
        handleCodeInApp: false,
      });
      setMsg("Verification email re-sent.");
    } catch (e) {
      setMsg(e.message || "Failed to resend.");
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 mt-10 bg-white dark:bg-gray-800 shadow rounded">
      <h2 className="text-xl font-semibold mb-2">Check your inbox</h2>
      <p className="mb-4">We sent a verification link to <strong>{email}</strong>. Also check Spam/Promotions.</p>
      <button onClick={resend} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">Resend email</button>
      {msg && <p className="mt-3 text-sm">{msg}</p>}
    </div>
  );
}
