import React, { useMemo, useState } from "react";
import { auth } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { FiMail, FiLock, FiAlertCircle, FiUserPlus, FiLogIn } from "react-icons/fi";

export default function AuthForm({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const title = isRegister ? "Registrieren" : "Einloggen";
  const submitLabel = isRegister ? "Registrieren" : "Einloggen";

  const helperText = useMemo(() => {
    return isRegister
      ? "Erstellen Sie ein Konto, um Immobilien zu speichern, zu vergleichen und zu verwalten."
      : "Melden Sie sich an, um auf Ihr Dashboard, Favoriten und gespeicherte Anzeigen zuzugreifen.";
  }, [isRegister]);

  const mapFirebaseError = (message) => {
    const msg = String(message || "").toLowerCase();

    if (msg.includes("invalid-email")) return "Die E-Mail-Adresse ist ungültig.";
    if (msg.includes("user-not-found")) return "Für diese E-Mail wurde kein Konto gefunden.";
    if (msg.includes("wrong-password")) return "Das Passwort ist nicht korrekt.";
    if (msg.includes("email-already-in-use")) return "Diese E-Mail-Adresse wird bereits verwendet.";
    if (msg.includes("weak-password")) return "Das Passwort ist zu schwach. Bitte mindestens 6 Zeichen verwenden.";
    if (msg.includes("too-many-requests")) return "Zu viele Versuche. Bitte warten Sie kurz und versuchen Sie es erneut.";
    if (msg.includes("network-request-failed")) return "Netzwerkfehler. Bitte prüfen Sie Ihre Verbindung.";
    return message || "Ein unbekannter Fehler ist aufgetreten.";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setError("");
    setSubmitting(true);

    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }

      onLogin?.(email);
    } catch (err) {
      setError(mapFirebaseError(err?.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-slate-950 md:p-8"
      >
        <div className="mb-6">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
            {isRegister ? <FiUserPlus size={14} /> : <FiLogIn size={14} />}
            {title}
          </div>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {title}
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
            {helperText}
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              E-Mail
            </label>
            <div className="relative">
              <FiMail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                placeholder="name@beispiel.de"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full rounded-2xl border border-gray-300 bg-white py-3 pl-10 pr-4 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Passwort
            </label>
            <div className="relative">
              <FiLock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={isRegister ? "new-password" : "current-password"}
                className="w-full rounded-2xl border border-gray-300 bg-white py-3 pl-10 pr-4 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>
          </div>

          {error ? (
            <div className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/10 dark:text-red-300">
              <FiAlertCircle className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-12 w-full items-center justify-center rounded-full bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Bitte warten..." : submitLabel}
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            setIsRegister((prev) => !prev);
            setError("");
          }}
          className="mt-5 w-full text-center text-sm font-medium text-blue-600 transition hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          {isRegister
            ? "Schon registriert? Jetzt einloggen."
            : "Noch kein Konto? Jetzt registrieren."}
        </button>
      </form>
    </div>
  );
}