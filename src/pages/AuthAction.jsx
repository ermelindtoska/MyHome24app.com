// src/pages/AuthAction.jsx
import React, { useEffect, useMemo, useState } from "react";
import { applyActionCode } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { auth } from "../firebase";
import SiteMeta from "../components/SEO/SiteMeta";
import { FaCheckCircle, FaExclamationTriangle, FaSpinner } from "react-icons/fa";

export default function AuthAction() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation("authAction");

  const [status, setStatus] = useState("processing"); // processing | ok | failed
  const [mode, setMode] = useState("");

  const lang = i18n.language?.slice(0, 2) || "de";
  const canonical = useMemo(
    () => `${window.location.origin}/auth/action`,
    []
  );

  useEffect(() => {
    let redirectTimer = null;

    (async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const m = params.get("mode") || "";
        const oobCode = params.get("oobCode") || "";

        setMode(m);

        // Aktualisht mbështesim verifyEmail (mund ta zgjerojmë më vonë)
        if (m !== "verifyEmail" || !oobCode) {
          setStatus("failed");
          return;
        }

        await applyActionCode(auth, oobCode);

        setStatus("ok");

        // ridrejto te login me flag që e lexon LoginForm.jsx
        redirectTimer = setTimeout(() => {
          navigate("/login?verified=1", { replace: true });
        }, 900);
      } catch (e) {
        console.error("[AuthAction] action failed:", e);
        setStatus("failed");
      }
    })();

    return () => {
      if (redirectTimer) clearTimeout(redirectTimer);
    };
  }, [navigate]);

  const title =
    status === "ok"
      ? t("metaTitleOk", { defaultValue: "E-Mail bestätigt – MyHome24App" })
      : status === "failed"
      ? t("metaTitleFailed", { defaultValue: "Link ungültig – MyHome24App" })
      : t("metaTitleProcessing", {
          defaultValue: "Verifizierung… – MyHome24App",
        });

  const description =
    status === "ok"
      ? t("metaDescriptionOk", {
          defaultValue:
            "Deine E-Mail wurde erfolgreich bestätigt. Du wirst gleich zum Login weitergeleitet.",
        })
      : status === "failed"
      ? t("metaDescriptionFailed", {
          defaultValue:
            "Der Bestätigungslink ist ungültig oder abgelaufen. Bitte fordere einen neuen Link an.",
        })
      : t("metaDescriptionProcessing", {
          defaultValue:
            "Wir verifizieren deine E-Mail. Bitte einen Moment warten.",
        });

  const handleGoLogin = () => navigate("/login", { replace: true });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 pt-16 md:pt-0">
      <SiteMeta
        title={title}
        description={description}
        canonical={canonical}
        lang={lang}
        noindex
      />

      <div className="min-h-[70vh] flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-6 md:p-7">
          {/* Header */}
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
              {status === "processing" && (
                <FaSpinner className="animate-spin text-slate-500" />
              )}
              {status === "ok" && (
                <FaCheckCircle className="text-emerald-500" />
              )}
              {status === "failed" && (
                <FaExclamationTriangle className="text-rose-500" />
              )}
            </div>

            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {t("badge", { defaultValue: "Account" })}
              </p>

              <h1 className="text-lg md:text-xl font-semibold">
                {status === "processing" &&
                  t("titleProcessing", {
                    defaultValue: "Verifizierung läuft…",
                  })}
                {status === "ok" &&
                  t("titleOk", { defaultValue: "E-Mail bestätigt" })}
                {status === "failed" &&
                  t("titleFailed", { defaultValue: "Link ungültig" })}
              </h1>
            </div>
          </div>

          {/* Body */}
          <div className="mt-4 text-sm text-slate-600 dark:text-slate-300">
            {status === "processing" && (
              <p>
                {t("processing", {
                  defaultValue:
                    "Bitte einen Moment warten. Wir prüfen deine Anfrage…",
                })}
              </p>
            )}

            {status === "ok" && (
              <div className="space-y-2">
                <p className="text-emerald-600 dark:text-emerald-300 font-medium">
                  {t("ok", {
                    defaultValue:
                      "Deine E-Mail wurde erfolgreich bestätigt. Du wirst gleich zum Login weitergeleitet…",
                  })}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t("okHint", {
                    defaultValue:
                      "Falls die Weiterleitung nicht funktioniert, nutze den Button unten.",
                  })}
                </p>
              </div>
            )}

            {status === "failed" && (
              <div className="space-y-2">
                <p className="text-rose-600 dark:text-rose-300 font-medium">
                  {t("failed", {
                    defaultValue:
                      "E-Mail-Bestätigung fehlgeschlagen oder Link abgelaufen.",
                  })}
                </p>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t("failedHint", {
                    defaultValue:
                      "Bitte versuche es erneut über den Login oder fordere einen neuen Bestätigungslink an.",
                  })}
                </p>

                {mode && (
                  <p className="text-[11px] text-slate-400">
                    {t("debugMode", {
                      defaultValue: "Aktion: {{mode}}",
                      mode,
                    })}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-col sm:flex-row gap-2 sm:justify-end">
            <button
              type="button"
              onClick={handleGoLogin}
              className="inline-flex justify-center rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 transition
                         focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900"
            >
              {t("actions.goLogin", { defaultValue: "Zum Login" })}
            </button>

            {status === "failed" && (
              <button
                type="button"
                onClick={() => navigate("/register", { replace: false })}
                className="inline-flex justify-center rounded-full border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                {t("actions.goRegister", {
                  defaultValue: "Konto erstellen",
                })}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}