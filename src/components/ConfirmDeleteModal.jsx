import React, { useEffect, useRef } from "react";
import { FiX, FiTrash2, FiAlertTriangle } from "react-icons/fi";
import { useTranslation } from "react-i18next";

const ConfirmDeleteModal = ({ onCancel, onConfirm }) => {
  const { t } = useTranslation(["userDashboard"]);
  const overlayRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onCancel?.();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [onCancel]);

  const handleBackdropClick = (e) => {
    if (e.target === overlayRef.current) {
      onCancel?.();
    }
  };

  return (
    <div
      ref={overlayRef}
      onMouseDown={handleBackdropClick}
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white/95 px-5 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
          <button
            type="button"
            onClick={onCancel}
            className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50 hover:text-black dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            aria-label={t("cancel", { defaultValue: "Schließen" })}
          >
            <FiX size={18} />
          </button>

          <div className="flex items-start gap-3 pr-12">
            <div className="mt-0.5 flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400">
              <FiAlertTriangle size={22} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {t("confirm_delete_title", {
                  defaultValue: "Anzeige löschen?",
                })}
              </h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-slate-300">
                {t("confirm_delete_message", {
                  defaultValue:
                    "Möchtest du diese Anzeige wirklich dauerhaft löschen?",
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 py-5">
          <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-300">
            {t("confirm.deleteText", {
              defaultValue:
                "Diese Aktion kann nicht rückgängig gemacht werden.",
            })}
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex h-11 items-center justify-center rounded-full border border-gray-300 px-5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
            >
              {t("cancel", { defaultValue: "Abbrechen" })}
            </button>

            <button
              type="button"
              onClick={onConfirm}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-red-600 px-5 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              <FiTrash2 size={16} />
              {t("yes_delete", { defaultValue: "Ja, löschen" })}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;