import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuthState } from "react-firebase-hooks/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { FiShield, FiUserCheck } from "react-icons/fi";

import { auth, db } from "../firebase";
import { logEvent } from "../utils/logEvent";

import { Dialog, DialogContent, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { useToast } from "./ui/use-toast";

export default function RequestOwnerUpgradeModal({ open, onClose }) {
  const { t } = useTranslation("upgradeRequest");
  const { toast } = useToast();
  const [user] = useAuthState(auth);

  const [targetRole, setTargetRole] = useState("owner");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const trimmedReason = useMemo(() => reason.trim(), [reason]);
  const reasonTooShort = trimmedReason.length > 0 && trimmedReason.length < 10;
  const canSubmit = !!user && !isSubmitting && trimmedReason.length >= 10;

  useEffect(() => {
    if (!open) {
      setTargetRole("owner");
      setReason("");
      setIsSubmitting(false);
    }
  }, [open]);

  const handleSafeClose = () => {
    if (isSubmitting) return;
    onClose?.();
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: t("error"),
        description: t("mustBeLoggedIn"),
        variant: "destructive",
      });
      return;
    }

    if (!trimmedReason) {
      toast({
        title: t("error"),
        description: t("fillReason"),
        variant: "destructive",
      });
      return;
    }

    if (trimmedReason.length < 10) {
      toast({
        title: t("error"),
        description: t("helperText"),
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      await setDoc(
        doc(db, "roleUpgradeRequests", user.uid),
        {
          userId: user.uid,
          email: user.email || "",
          fullName: user.displayName || "",
          targetRole,
          reason: trimmedReason,
          status: "pending",
          requestedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      await logEvent({
        type: "role.requested",
        message: `Rollenwechsel auf "${targetRole}" angefragt.`,
        userId: user.uid,
        targetRole,
        reason: trimmedReason,
        context: "request-owner-upgrade",
        extra: {
          requestId: user.uid,
        },
      });

      toast({
        title: t("success"),
        description: t("requestSent"),
      });

      setReason("");
      setTargetRole("owner");
      onClose?.();
    } catch (error) {
      console.error("[RequestOwnerUpgradeModal] submit error:", error);

      toast({
        title: t("error"),
        description: t("requestFailed"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleSafeClose}>
      <DialogContent className="w-[95vw] max-w-xl rounded-3xl border border-gray-200 bg-white p-0 shadow-2xl dark:border-gray-800 dark:bg-gray-950">
        <div className="overflow-hidden rounded-3xl">
          {/* Header */}
          <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 via-white to-indigo-50 px-6 py-5 dark:border-gray-800 dark:from-blue-950/30 dark:via-gray-950 dark:to-indigo-950/20">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md">
                <FiShield className="text-xl" />
              </div>

              <div className="min-w-0">
                <DialogTitle className="text-left text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {t("title")}
                </DialogTitle>
                <p className="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-300">
                  {t("description")}
                </p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-6">
            <div className="mb-5 rounded-2xl border border-blue-100 bg-blue-50/70 p-4 dark:border-blue-900/40 dark:bg-blue-900/10">
              <div className="flex items-start gap-3">
                <FiUserCheck className="mt-0.5 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {t("targetRoleLabel")}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-gray-600 dark:text-gray-400">
                    {t("helperText")}
                  </p>
                </div>
              </div>
            </div>

            {/* Role select */}
            <div className="mb-4">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("targetRoleLabel")}
              </label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                disabled={isSubmitting}
                className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              >
                <option value="owner">{t("roles.owner")}</option>
                <option value="agent">{t("roles.agent")}</option>
              </select>
            </div>

            {/* Reason */}
            <div className="mb-2">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("placeholder")}
              </label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={t("placeholder")}
                disabled={isSubmitting}
                className="min-h-[140px] rounded-2xl border-gray-300 text-sm leading-6 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              />
            </div>

            <div className="mt-2 flex items-center justify-between gap-3">
              <p
                className={`text-xs ${
                  reasonTooShort
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {reasonTooShort
                  ? t("helperText")
                  : `${trimmedReason.length}/10+`}
              </p>

              {targetRole && (
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                  {targetRole === "owner"
                    ? t("roles.owner")
                    : t("roles.agent")}
                </span>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col-reverse gap-3 border-t border-gray-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-end dark:border-gray-800">
            <Button
              type="button"
              variant="ghost"
              onClick={handleSafeClose}
              disabled={isSubmitting}
              className="rounded-full"
            >
              {t("cancel")}
            </Button>

            <Button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="rounded-full bg-blue-600 px-5 text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {isSubmitting ? t("sending") : t("send")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}