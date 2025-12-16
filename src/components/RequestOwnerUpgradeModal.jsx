// src/components/RequestOwnerUpgradeModal.jsx
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

import { Dialog, DialogContent, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { useToast } from "./ui/use-toast";
import { logEvent } from "../utils/logEvent";

export default function RequestOwnerUpgradeModal({ open, onClose }) {
  const { t } = useTranslation("upgradeRequest");
  const { toast } = useToast();
  const [user] = useAuthState(auth);

  // nëse do të lejosh edhe “agent”, mund të përdorim një select
  const [targetRole, setTargetRole] = useState("owner");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: t("error"),
        description: t("mustBeLoggedIn"),
        variant: "destructive",
      });
      return;
    }
    if (!reason.trim()) {
      toast({
        title: t("error"),
        description: t("fillReason"),
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Dokument wird unter user.uid gespeichert (merge = true)
      await setDoc(
        doc(db, "roleUpgradeRequests", user.uid),
        {
          userId: user.uid,
          email: user.email || "",
          fullName: user.displayName || "",
          targetRole, // 🔥 admin-i e di në çfarë roli kërkon të shkojë
          reason: reason.trim(),
          status: "pending",
          requestedAt: serverTimestamp(),
        },
        { merge: true }
      );

      // 🔵 LOG: Rollenwechsel-Anfrage erstellt
      await logEvent({
        type: "role.requested",
        message: `Rollenwechsel auf "${targetRole}" angefragt.`,
        userId: user.uid,
        targetRole,
        reason: reason.trim(),
        context: "request-owner-upgrade",
        extra: {
          // requestId = Dokument-ID, këtu e përdorim user.uid
          requestId: user.uid,
        },
      });

      toast({ title: t("success"), description: t("requestSent") });
      setReason("");
      onClose?.();
    } catch (error) {
      console.error("[RequestOwnerUpgrade] submit error:", error);
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
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogTitle className="mb-1">{t("title")}</DialogTitle>
        <p className="mb-3 text-sm text-gray-600 dark:text-gray-300">
          {t("description")}
        </p>

        {/* Zgjedhja e rolit – mund ta lësh të fshehur nëse do vetëm owner */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t("targetRoleLabel")}
          </label>
          <select
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
          >
            <option value="owner">{t("roles.owner")}</option>
            <option value="agent">{t("roles.agent")}</option>
          </select>
        </div>

        <div className="mb-2">
          <Textarea
            placeholder={t("placeholder")}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={onClose}>
            {t("cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? t("sending") : t("send")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
