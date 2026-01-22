import React, { useEffect, useState } from "react";
import { applyActionCode } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";

export default function AuthAction() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("processing"); // processing | ok | failed

  useEffect(() => {
    (async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const mode = params.get("mode");
        const oobCode = params.get("oobCode");

        if (mode !== "verifyEmail" || !oobCode) {
          setStatus("failed");
          return;
        }

        await applyActionCode(auth, oobCode);

        setStatus("ok");

        // ridrejto te login me flag që ti e lexon te LoginForm.jsx
        setTimeout(() => {
          navigate("/login?verified=1", { replace: true });
        }, 800);
      } catch (e) {
        console.error("[AuthAction] verify failed:", e);
        setStatus("failed");
      }
    })();
  }, [navigate]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 p-6 rounded shadow">
        {status === "processing" && (
          <p className="text-gray-700 dark:text-gray-200">
            Verifizierung läuft…
          </p>
        )}
        {status === "ok" && (
          <p className="text-green-600">
            E-Mail bestätigt. Weiterleitung zum Login…
          </p>
        )}
        {status === "failed" && (
          <p className="text-red-500">
            E-Mail-Bestätigung fehlgeschlagen oder Link abgelaufen.
          </p>
        )}
      </div>
    </div>
  );
}
