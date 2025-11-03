// src/components/RequestOwnerUpgradeSection.jsx
import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { useTranslation } from "react-i18next";

// NB: tek ti nuk ka DialogHeader – import vetëm këto katër:
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { useToast } from "./ui/use-toast";

export default function RequestOwnerUpgradeSection() {
  const { t } = useTranslation("upgradeRequest");
  const { toast } = useToast();

  const user = auth.currentUser;
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const [existing, setExisting] = useState(null); // {status, reason, requestedAt} ose null
  const [role, setRole] = useState("user");

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      try {
        const u = await getDoc(doc(db, "users", user.uid));
        if (u.exists()) setRole(u.data()?.role || "user");

        const r = await getDoc(doc(db, "roleUpgradeRequests", user.uid));
        setExisting(r.exists() ? r.data() : null);
      } catch (e) {
        console.error("[RequestOwnerUpgradeSection] load error:", e);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  const submit = async () => {
    if (!user) {
      toast({ title: t("error"), description: t("mustBeLoggedIn"), variant: "destructive" });
      return;
    }
    if (!reason.trim()) {
      toast({ title: t("error"), description: t("fillReason"), variant: "destructive" });
      return;
    }
    try {
      setLoading(true);
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
      toast({ title: t("success"), description: t("requestSent") });
      setOpen(false);
      setReason("");

      const r = await getDoc(doc(db, "roleUpgradeRequests", user.uid));
      setExisting(r.exists() ? r.data() : null);
    } catch (e) {
      console.error("[RequestOwnerUpgradeSection] submit error:", e);
      toast({ title: t("error"), description: t("requestFailed"), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const renderStatus = () => {
    if (role === "owner" || role === "admin") {
      return (
        <p className="text-sm">
          <span className="font-medium">{t("youAreOwner")}</span> {t("youCanPublishNow")}
        </p>
      );
    }
    if (!existing) return <p className="text-sm">{t("noRequestYet")}</p>;

    const s = existing.status || "pending";
    if (s === "pending") {
      return (
        <p className="text-sm">
          <span className="font-medium">{t("statusPending")}</span> — {t("waitForDecision")}
        </p>
      );
    }
    if (s === "approved") {
      return (
        <p className="text-sm">
          <span className="font-medium text-green-600">{t("statusApproved")}</span> — {t("reloginHint")}
        </p>
      );
    }
    if (s === "rejected") {
      return (
        <p className="text-sm">
          <span className="font-medium text-red-600">{t("statusRejected")}</span>
          {existing.reason ? <> — {t("yourReasonWas")} “{existing.reason}”</> : null}
        </p>
      );
    }
    return <p className="text-sm">{t("noRequestYet")}</p>;
  };

  const canRequest =
    role === "user" && (!existing || (existing && existing.status === "rejected"));

  return (
    <div className="rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-900/30 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
      <div>
        <h3 className="text-base font-semibold mb-1">{t("upgradeToOwner")}</h3>
        {renderStatus()}
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => setOpen(true)}
          disabled={!canRequest}
          title={!canRequest ? t("cannotRequestNow") : undefined}
        >
          {t("requestOwnerUpgrade")}
        </Button>
        <Button asChild>
          <a href="/publish">{t("goToPublish")}</a>
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          {/* Zëvendëson DialogHeader */}
          <div className="mb-2">
            <DialogTitle>{t("title")}</DialogTitle>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-300">{t("helperText")}</p>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t("placeholder")}
              rows={5}
            />
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              {t("cancel")}
            </Button>
            <Button onClick={submit} disabled={loading}>
              {loading ? t("sending") : t("send")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
