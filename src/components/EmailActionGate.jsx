import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { applyActionCode } from "firebase/auth";
import { auth } from "../firebase";
import { FiCheckCircle, FiAlertCircle, FiLoader } from "react-icons/fi";

const EmailActionGate = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isAuthActionPage = location.pathname === "/auth/action";

  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const mode = params.get("mode");
  const oobCode = params.get("oobCode");

  const [title, setTitle] = useState("Working…");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("loading"); // loading | success | error

  useEffect(() => {
    if (!isAuthActionPage) return;

    let cancelled = false;

    const run = async () => {
      if (!mode || !oobCode) {
        if (cancelled) return;
        setStatus("error");
        setTitle("Verification failed");
        setMessage("Missing verification code.");
        return;
      }

      try {
        if (mode === "verifyEmail") {
          await applyActionCode(auth, oobCode);

          if (cancelled) return;
          setStatus("success");
          setTitle("E-mail verified");
          setMessage("Your e-mail address was verified successfully. You can sign in now.");
        } else {
          if (cancelled) return;
          setStatus("error");
          setTitle("Unsupported action");
          setMessage(`Unknown action: ${mode}`);
        }
      } catch (error) {
        if (cancelled) return;
        setStatus("error");
        setTitle("Verification failed");
        setMessage(error?.message || "This link could not be verified.");
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [isAuthActionPage, mode, oobCode]);

  if (!isAuthActionPage) return null;

  const goHome = () => navigate("/", { replace: true });
  const goLogin = () => navigate("/login", { replace: true });

  const icon =
    status === "loading" ? (
      <FiLoader className="h-5 w-5 animate-spin text-blue-400" />
    ) : status === "success" ? (
      <FiCheckCircle className="h-5 w-5 text-emerald-400" />
    ) : (
      <FiAlertCircle className="h-5 w-5 text-red-400" />
    );

  const accentClass =
    status === "loading"
      ? "border-blue-500/30"
      : status === "success"
      ? "border-emerald-500/30"
      : "border-red-500/30";

  return (
    <div className="fixed inset-x-0 top-4 z-[9999] flex justify-center px-4 pointer-events-none">
      <div
        className={`pointer-events-auto w-full max-w-md rounded-2xl border ${accentClass} bg-slate-950/95 text-white shadow-2xl backdrop-blur-xl`}
      >
        <div className="p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-full bg-white/5">
              {icon}
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="text-base font-semibold">{title}</h2>
              {message ? (
                <p className="mt-1 text-sm text-slate-300 leading-6">{message}</p>
              ) : null}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={goHome}
              className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Back to Home
            </button>

            {status === "success" && (
              <button
                type="button"
                onClick={goLogin}
                className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Sign in
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailActionGate;