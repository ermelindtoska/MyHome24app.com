// src/components/RequestOwnerUpgradeSection.jsx
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { useRole } from "../roles/RoleContext";
import { FiUser, FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import RequestOwnerUpgradeModal from "./RequestOwnerUpgradeModal";

const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
  approved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
};

function prettyRole(t, role) {
  if (!role) return t("upgradeRequest:currentRole.unknown");
  if (role === "owner") return t("upgradeRequest:currentRole.owner");
  if (role === "agent") return t("upgradeRequest:currentRole.agent");
  return t("upgradeRequest:currentRole.user");
}

export default function RequestOwnerUpgradeSection() {
  const { t } = useTranslation(["userDashboard", "upgradeRequest"]);
  const { role } = useRole();
  const [user] = useAuthState(auth);

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);

  // Lexo në kohë reale kërkesën e user-it aktual (nëse ekziston)
  useEffect(() => {
    if (!user) {
      setRequest(null);
      setLoading(false);
      return;
    }

    const ref = doc(db, "roleUpgradeRequests", user.uid);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          setRequest({ id: snap.id, ...snap.data() });
        } else {
          setRequest(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error("[RequestOwnerUpgradeSection] onSnapshot error:", err);
        setLoading(false);
      }
    );

    return unsub;
  }, [user]);

  if (!user) return null; // nëse s'është loguar, mos shfaq asgjë

  const hasElevatedRole = role === "owner" || role === "agent";
  const status = request?.status || null;

  return (
    <section className="mt-4 mb-8">
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 sm:p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300">
              <FiUser className="text-xl" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
                {t("upgradeRequest:card.title")}
              </h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                {t("upgradeRequest:card.subtitle")}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                <span className="font-medium text-gray-700 dark:text-gray-200">
                  {t("upgradeRequest:card.currentRoleLabel")}{" "}
                </span>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-800 dark:bg-gray-800 dark:text-gray-100">
                  {prettyRole(t, role)}
                </span>

                {loading ? (
                  <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                    {t("upgradeRequest:card.loadingStatus")}
                  </span>
                ) : status ? (
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                      STATUS_COLORS[status] || STATUS_COLORS.pending
                    }`}
                  >
                    {status === "pending" && <FiAlertCircle className="text-sm" />}
                    {status === "approved" && <FiCheckCircle className="text-sm" />}
                    {status === "rejected" && <FiAlertCircle className="text-sm" />}
                    {t(`upgradeRequest:status.${status}`)}
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          {/* Butoni kryesor */}
          <div className="flex items-center">
            {hasElevatedRole ? (
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-900 dark:text-green-100">
                {t("upgradeRequest:card.alreadyOwner")}
              </span>
            ) : status === "pending" ? (
              <button
                type="button"
                disabled
                className="rounded-full border border-yellow-300 bg-yellow-50 px-3 py-1 text-xs font-semibold text-yellow-800 dark:border-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-100"
              >
                {t("upgradeRequest:card.requestPending")}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setOpenModal(true)}
                className="rounded-full bg-blue-600 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
              >
                {t("upgradeRequest:card.ctaRequestOwner")}
              </button>
            )}
          </div>
        </div>

        {/* Info e vogël poshtë */}
        {!hasElevatedRole && (
          <p className="mt-3 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            {t("upgradeRequest:card.helperText")}
          </p>
        )}
      </div>

      {/* Modal */}
      <RequestOwnerUpgradeModal
        open={openModal}
        onClose={() => setOpenModal(false)}
      />
    </section>
  );
}
