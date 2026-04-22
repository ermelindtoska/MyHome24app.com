import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FiX } from "react-icons/fi";

const ComparePanel = ({ selectedListings = [], onClose }) => {
  const { t } = useTranslation("compare");
  const navigate = useNavigate();

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    document.addEventListener("keydown", handleKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[1000] flex">
      {/* BACKDROP */}
      <div
        className="flex-1 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* PANEL */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ duration: 0.3 }}
        className="w-full sm:w-[420px] h-full bg-white dark:bg-slate-950 shadow-2xl border-l border-gray-200 dark:border-slate-800 flex flex-col"
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-slate-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {t("title", { defaultValue: "Vergleich" })}
          </h2>

          <button
            onClick={onClose}
            className="h-10 w-10 rounded-full border border-gray-200 dark:border-slate-800 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-slate-800"
          >
            <FiX />
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {selectedListings.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {t("noSelection", {
                defaultValue: "Keine Anzeigen ausgewählt.",
              })}
            </p>
          ) : (
            selectedListings.map((listing) => (
              <div
                key={listing.id}
                className="flex gap-3 border border-gray-200 dark:border-slate-800 rounded-2xl p-3 bg-gray-50 dark:bg-slate-900 hover:bg-gray-100 dark:hover:bg-slate-800 transition"
              >
                {/* IMAGE */}
                <img
                  src={
                    listing.imageUrls?.[0] ||
                    listing.imageUrl ||
                    "/placeholder.jpg"
                  }
                  alt={listing.title}
                  className="w-20 h-16 object-cover rounded-lg"
                />

                {/* INFO */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {listing.title}
                  </h3>

                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {listing.city}
                  </p>

                  <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
                    € {listing.price?.toLocaleString() || "0"}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* FOOTER */}
        {selectedListings.length > 0 && (
          <div className="p-4 border-t border-gray-200 dark:border-slate-800">
            <button
              onClick={() => navigate("/compare")}
              className="w-full h-11 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
            >
              {t("goToCompare", {
                defaultValue: "Zum Vergleich",
              })}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ComparePanel;