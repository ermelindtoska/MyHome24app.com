// src/components/RequestOwnerUpgradeModal.jsx
import React, { useState } from "react";
import { Dialog } from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { useTranslation } from "react-i18next";
import { auth, db } from "../firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useToast } from "../components/ui/use-toast";

const RequestOwnerUpgradeModal = ({ open, onClose }) => {
  const { t } = useTranslation("upgradeRequest");
  const { toast } = useToast();
  const user = auth.currentUser;

  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    // Guard: user muss eingeloggt sein
    if (!user) {
      toast({
        title: t("error"),
        description: t("mustBeLoggedIn"),
        variant: "destructive",
      });
      return;
    }

    // Guard: Begründung
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
        doc(db, "roleUpgradeRequests", user.uid),
        {
          userId: user.uid,
          email: user.email || "",
          fullName: user.displayName || "",
          reason: reason.trim(),
          status: "pending",
          requestedAt: serverTimestamp(),
        },
        { merge: true }
      );

      // Nur AUFRUFEN, nicht rendern -> kein React-child-Objekt!
      toast({
        title: t("success"),
        description: t("requestSent"),
      });

      setReason("");
      onClose();
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
      <div className="p-6 space-y-4 bg-white dark:bg-gray-900 rounded-xl max-w-md mx-auto">
        <h2 className="text-xl font-semibold">{t("title")}</h2>
        <Textarea
          placeholder={t("placeholder")}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            {t("cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? t("sending") : t("send")}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

export default RequestOwnerUpgradeModal;
