// src/components/RequestOwnerUpgradeModal.jsx
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

// shadcn/ui – kujdes me path-in (je brenda src/components)
import { Dialog, DialogContent, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { useToast } from "./ui/use-toast";

export default function RequestOwnerUpgradeModal({ open, onClose }) {
  const { t } = useTranslation("upgradeRequest");
  const { toast } = useToast();
  const [user] = useAuthState(auth);

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

      await setDoc(
        doc(db, "roleUpgradeRequests", user.uid), // një dokument /user.uid
        {
          userId: user.uid,
          email: user.email || "",
          fullName: user.displayName || "",
          reason: reason.trim(),
          status: "pending",
          requestedAt: serverTimestamp(), // emër konsistent me AdminDashboard
        },
        { merge: true }
      );

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
        <div className="mb-2">
        <DialogTitle>{t("title")}</DialogTitle>
        </div>

        <Textarea
          placeholder={t("placeholder")}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />

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
