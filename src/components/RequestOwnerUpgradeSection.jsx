import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuthState } from "react-firebase-hooks/auth";
import { doc, onSnapshot } from "firebase/firestore";
import {
  FiUser,
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiShield,
} from "react-icons/fi";

import { auth, db } from "../firebase";
import { useRole } from "../roles/RoleContext";
import RequestOwnerUpgradeModal from "./RequestOwnerUpgradeModal";

const STATUS_STYLES = {
  pending:
    "border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-100",
  approved:
    "border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/30 dark:text-green-100",
  rejected:
    "border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-900/30 dark:text-red-100",
};

function getStatusIcon(status) {
  if (status === "approved") return <FiCheckCircle className="text-sm" />;
  if (status === "rejected") return <FiAlertCircle className="text-sm" />;
  return <FiClock className="text-sm" />;
}

function prettyRole(t, role) {
  if (!role) return t("upgradeRequest:currentRole.unknown");
  if (role === "owner") return t("upgradeRequest:currentRole.owner");
  if (role === "agent") return t("upgradeRequest:currentRole.agent");
  if (role === "admin") return t("upgradeRequest:currentRole.admin", { defaultValue: "Admin" });
  return t("upgradeRequest:currentRole.user");
}

export default function RequestOwnerUpgradeSection() {
  const { t } = useTranslation(["userDashboard", "upgradeRequest"]);
  const { role } = useRole();
  const [user] = useAuthState(auth);

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    if (!user?.uid) {
      setRequest(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    const requestRef = doc(db, "roleUpgradeRequests", user.uid);

    const unsub = onSnapshot(
      requestRef,
      (snap) => {
        if (snap.exists()) {
          setRequest({ id: snap.id, ...snap.data() });
        } else {
          setRequest(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error("[RequestOwnerUpgradeSection] onSnapshot error:", error);
        setRequest(null);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [user?.uid]);

  const hasElevatedRole = useMemo(() => {
    return role === "owner" || role === "agent" || role === "admin";
  }, [role]);

  const status = request?.status || null;

  const statusClass =
    STATUS_STYLES[status] || STATUS_STYLES.pending;

  if (!user) return null;

  return (
    <>
      <section className="mt-4 mb-8">
        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="bg-gradient-to-r from-blue-50 via-white to-indigo-50 px-4 py-4 dark:from-blue-950/40 dark:via-gray-900 dark:to-indigo-950/40 sm:px-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 shadow-sm dark:bg-blue-900/40 dark:text-blue-300">
                  <FiShield className="text-xl" />
                </div>

                <div className="min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {t("upgradeRequest:card.title")}
                  </h3>

                  <p className="mt-1 max-w-2xl text-sm text-gray-600 dark:text-gray-300">
                    {t("upgradeRequest:card.subtitle")}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      {t("upgradeRequest:card.currentRoleLabel")}
                    </span>

                    <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">
                      <FiUser className="text-sm" />
                      {prettyRole(t, role)}
                    </span>

                    {loading ? (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {t("upgradeRequest:card.loadingStatus")}
                      </span>
                    ) : status ? (
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${statusClass}`}
                      >
                        {getStatusIcon(status)}
                        {t(`upgradeRequest:status.${status}`)}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 items-center">
                {hasElevatedRole ? (
                  <span className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-4 py-2 text-xs font-semibold text-green-700 dark:border-green-800 dark:bg-green-900/30 dark:text-green-100">
                    {t("upgradeRequest:card.alreadyOwner")}
                  </span>
                ) : status === "pending" ? (
                  <button
                    type="button"
                    disabled
                    className="inline-flex items-center rounded-full border border-yellow-300 bg-yellow-50 px-4 py-2 text-xs font-semibold text-yellow-800 opacity-90 dark:border-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-100"
                  >
                    {t("upgradeRequest:card.requestPending")}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setOpenModal(true)}
                    className="inline-flex items-center rounded-full bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 sm:text-sm"
                  >
                    {t("upgradeRequest:card.ctaRequestOwner")}
                  </button>
                )}
              </div>
            </div>
          </div>

          {!hasElevatedRole && (
            <div className="border-t border-gray-100 px-4 py-3 dark:border-gray-800 sm:px-6">
              <p className="text-xs leading-6 text-gray-500 dark:text-gray-400 sm:text-sm">
                {status === "rejected"
                  ? t("upgradeRequest:card.helperRejected", {
                      defaultValue:
                        "Ihre letzte Anfrage wurde abgelehnt. Sie können Ihre Angaben prüfen und eine neue Anfrage senden.",
                    })
                  : t("upgradeRequest:card.helperText")}
              </p>
            </div>
          )}
        </div>
      </section>

      <RequestOwnerUpgradeModal
        open={openModal}
        onClose={() => setOpenModal(false)}
      />
    </>
  );
}