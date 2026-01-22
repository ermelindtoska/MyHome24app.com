// src/pages/VerifyNeeded.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "../firebase";

export default function VerifyNeeded() {
  const { t } = useTranslation("auth");
  const location = useLocation();
  const navigate = useNavigate();

  const emailFromQuery = useMemo(() => {
    const sp = new URLSearchParams(location.search);
    return sp.get("email") || "";
  }, [location.search]);

  const [email, setEmail] = useState(emailFromQuery);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (!cooldown) return;
    const id = setInterval(() => setCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const actionCodeSettings = useMemo(() => {
    // Muss in Firebase -> Authentication -> Authorized domains erlaubt sein
    const origin = window.location.origin; // z.B. http://localhost:3001 oder https://www.myhome24app.com
    return {
      url: `${origin}/auth/action`,
      handleCodeInApp: true,
    };
  }, []);

  const handleResend = async () => {
    if (cooldown > 0) return;

    setErr("");
    setMsg("");
    setLoading(true);

    try {
      // 1) BEST CASE: User ist noch eingeloggt -> KEIN Passwort nötig
      const current = auth.currentUser;

      if (current && !current.emailVerified) {
        // Optional: wenn email im query gesetzt ist und NICHT zum current user passt,
        // dann erzwingen wir Re-Login, um an den richtigen Account zu kommen.
        if (email && current.email && current.email !== email) {
          // fallthrough zur Login-Variante unten
        } else {
          await sendEmailVerification(current, actionCodeSettings);
          setMsg(
            t("verifyNeeded.sent", {
              defaultValue:
                "✅ Bestätigungs-E-Mail wurde erneut gesendet. Bitte prüfe auch Spam/Promotions.",
            })
          );
          setCooldown(60);
          return;
        }
      }

      // 2) FALLBACK: User ist NICHT eingeloggt oder Email passt nicht -> Login nötig
      if (!email) {
        throw new Error(
          t("verifyNeeded.emailMissing", {
            defaultValue: "Bitte gib deine E-Mail-Adresse ein.",
          })
        );
      }

      if (!password) {
        throw new Error(
          t("verifyNeeded.passwordRequired", {
            defaultValue:
              "Bitte gib dein Passwort ein, damit wir dich kurz anmelden und die Verifizierung erneut senden können.",
          })
        );
      }

      const cred = await signInWithEmailAndPassword(auth, email, password);

      if (cred.user.emailVerified) {
        setMsg(
          t("verifyNeeded.alreadyVerified", {
            defaultValue:
              "✅ Deine E-Mail ist bereits verifiziert. Du wirst weitergeleitet …",
          })
        );
        setTimeout(() => navigate("/"), 800);
        return;
      }

      await sendEmailVerification(cred.user, actionCodeSettings);

      // Optional: danach direkt wieder ausloggen (wie du es bisher machst)
      await signOut(auth);

      setMsg(
        t("verifyNeeded.sent", {
          defaultValue:
            "✅ Bestätigungs-E-Mail wurde erneut gesendet. Bitte prüfe auch Spam/Promotions.",
        })
      );
      setCooldown(60);
    } catch (e) {
      const code = e?.code || "";
      const message = e?.message || String(e);

      // Häufige Firebase Fehler hübsch machen
      if (code === "auth/wrong-password" || code === "auth/invalid-credential") {
        setErr(
          t("verifyNeeded.wrongPassword", {
            defaultValue: "❌ Passwort ist falsch.",
          })
        );
      } else if (code === "auth/user-not-found") {
        setErr(
          t("verifyNeeded.userNotFound", {
            defaultValue: "❌ Kein Account mit dieser E-Mail gefunden.",
          })
        );
      } else if (code === "auth/too-many-requests") {
        setErr(
          t("verifyNeeded.tooMany", {
            defaultValue:
              "⏳ Zu viele Versuche. Bitte warte kurz und versuche es später erneut.",
          })
        );
      } else {
        setErr(
          t("verifyNeeded.genericError", {
            defaultValue: "❌ Fehler beim Senden: {{msg}}",
            msg: message,
          })
        );
      }
      // eslint-disable-next-line no-console
      console.error("[VerifyNeeded] resend failed:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur dark:bg-black/20">
        <h1 className="text-xl font-semibold text-white">
          {t("verifyNeeded.title", { defaultValue: "E-Mail bestätigen" })}
        </h1>
        <p className="mt-2 text-sm text-white/70">
          {t("verifyNeeded.hint", {
            defaultValue:
              "Bitte bestätige deine E-Mail-Adresse. Du kannst dir die Bestätigungs-Mail erneut senden lassen.",
          })}
        </p>

        <div className="mt-5 space-y-3">
          <div>
            <label className="text-sm text-white/80">
              {t("email", { defaultValue: "E-Mail" })}
            </label>
            <input
              className="mt-1 w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-white outline-none focus:border-sky-400 dark:bg-black/20"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="text-sm text-white/80">
              {t("password", { defaultValue: "Passwort" })}
              <span className="ml-2 text-xs text-white/50">
                {t("verifyNeeded.passwordOptional", {
                  defaultValue:
                    "(nur nötig, wenn du nicht mehr eingeloggt bist)",
                })}
              </span>
            </label>
            <input
              className="mt-1 w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-white outline-none focus:border-sky-400 dark:bg-black/20"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              type="password"
              autoComplete="current-password"
            />
          </div>

          {err ? (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {err}
            </div>
          ) : null}

          {msg ? (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
              {msg}
            </div>
          ) : null}

          <button
            onClick={handleResend}
            disabled={loading || cooldown > 0}
            className="mt-2 w-full rounded-xl bg-sky-600 px-4 py-2 font-semibold text-white hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {cooldown > 0
              ? t("verifyNeeded.cooldown", {
                  defaultValue: "Bitte warten ({{s}}s)…",
                  s: cooldown,
                })
              : loading
              ? t("loading", { defaultValue: "Lädt…" })
              : t("verifyNeeded.resend", {
                  defaultValue: "Verifizierung erneut senden",
                })}
          </button>

          <button
            onClick={() => navigate("/login")}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 font-semibold text-white hover:bg-white/10"
          >
            {t("backToLogin", { defaultValue: "Zurück zum Login" })}
          </button>
        </div>
      </div>
    </div>
  );
}
