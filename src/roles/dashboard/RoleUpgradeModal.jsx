import React, { useState } from "react";
import { FiShield, FiX, FiUserCheck } from "react-icons/fi";
import { requestRoleUpgrade } from "../../roles/changeRole";

export default function RoleUpgradeModal({ isOpen, onClose }) {
  const [targetRole, setTargetRole] = useState("owner");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  if (!isOpen) return null;

  const canSubmit = reason.trim().length >= 10;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit || loading) return;

    try {
      setLoading(true);
      setMessage("");

      const res = await requestRoleUpgrade(targetRole, reason);

      if (res.ok) {
        setMessage("Anfrage wurde erfolgreich gesendet.");
        setTimeout(() => {
          onClose?.();
          setReason("");
          setTargetRole("owner");
          setMessage("");
        }, 900);
      }
    } catch (error) {
      console.error("[RoleUpgradeModal] error:", error);
      setMessage("Fehler beim Senden der Anfrage.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
        >
          <FiX />
        </button>

        <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-6 dark:border-slate-800 dark:from-slate-900 dark:to-slate-950">
          <div className="flex gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg">
              <FiShield size={24} />
            </div>

            <div className="pr-10">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Rollen-Upgrade beantragen
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-slate-300">
                Beantrage eine höhere Rolle, wenn du Immobilien veröffentlichen
                oder professionell als Makler:in auftreten möchtest.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="max-h-[70vh] overflow-y-auto px-6 py-6">
          <div className="mb-6 rounded-2xl border border-blue-100 bg-blue-50 p-4 dark:border-blue-900/40 dark:bg-blue-950/30">
            <div className="flex gap-3">
              <FiUserCheck className="mt-1 text-blue-600 dark:text-blue-300" />
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  Gewünschte Rolle
                </h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-slate-300">
                  Wähle aus, welche Rolle du beantragen möchtest.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-800 dark:text-slate-200">
                Gewünschte Rolle
              </label>

              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-blue-900/30"
              >
                <option value="owner">Eigentümer:in</option>
                <option value="agent">Makler:in</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-800 dark:text-slate-200">
                Begründung
              </label>

              <textarea
                rows={6}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Beschreibe kurz, warum du diese Rolle benötigst..."
                className="w-full resize-y rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-blue-900/30"
              />
              <p className="mt-2 text-xs text-gray-500 dark:text-slate-400">
                {reason.trim().length}/10+ Zeichen erforderlich
              </p>
            </div>

            {message && (
              <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-300">
                {message}
              </div>
            )}
          </div>

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-gray-200 pt-5 dark:border-slate-800 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
            >
              Abbrechen
            </button>

            <button
              type="submit"
              disabled={!canSubmit || loading}
              className={`rounded-2xl px-5 py-3 text-sm font-semibold text-white transition ${
                canSubmit && !loading
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "cursor-not-allowed bg-blue-300"
              }`}
            >
              {loading ? "Wird gesendet..." : "Anfrage senden"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}