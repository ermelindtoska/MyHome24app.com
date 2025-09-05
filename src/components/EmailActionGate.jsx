// src/components/EmailActionGate.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { applyActionCode } from "firebase/auth";
import { auth } from "../firebase";

export default function EmailActionGate() {
  const loc = useLocation();
  const navigate = useNavigate();

  // Shfaqe VETËM në /auth/action
  if (loc.pathname !== "/auth/action") return null;

  const params = new URLSearchParams(loc.search);
  const mode = params.get("mode");
  const oobCode = params.get("oobCode");

  const [title, setTitle] = useState("Working…");
  const [msg, setMsg] = useState("");
  const [state, setState] = useState("loading"); // loading | ok | error

  useEffect(() => {
    async function run() {
      if (!mode || !oobCode) {
        setState("error");
        setTitle("Verification failed");
        setMsg("Missing verification code.");
        return;
      }
      try {
        if (mode === "verifyEmail") {
          await applyActionCode(auth, oobCode);
          setState("ok");
          setTitle("E-mail verified");
          setMsg("You may sign in now.");
        } else {
          setState("error");
          setTitle("Unsupported action");
          setMsg(`Unknown mode: ${mode}`);
        }
      } catch (e) {
        setState("error");
        setTitle("Verification failed");
        setMsg(e?.message || "Could not verify this link.");
      }
    }
    run();
  }, [mode, oobCode]);

  const goHome = () => navigate("/", { replace: true });
  const goLogin = () => navigate("/login", { replace: true });

  return (
    <div className="fixed inset-x-0 top-6 z-[9999] flex justify-center pointer-events-none">
      <div className="pointer-events-auto w-[380px] rounded-lg bg-slate-900/90 text-white shadow-lg ring-1 ring-black/10 p-4">
        <div className="font-semibold mb-1">{title}</div>
        {msg && <div className="text-sm opacity-90 mb-3">{msg}</div>}
        <div className="flex gap-2">
          <button
            onClick={goHome}
            className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700"
          >
            Back to Home
          </button>
          {state === "ok" && (
            <button
              onClick={goLogin}
              className="px-3 py-1 rounded bg-green-600 hover:bg-green-700"
            >
              Sign in
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
