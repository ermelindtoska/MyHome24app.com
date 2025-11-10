// src/components/profile/AvatarUploader.jsx
import React, { useState } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage, appCheckReady } from "../../firebase";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { auth, db } from "../../firebase";
import { updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

const mapStorageError = (err) => {
  const code = err?.code || "";
  if (code.includes("storage/unauthorized")) return "Kein Schreibzugriff auf Firebase Storage.";
  if (code.includes("storage/canceled")) return "Upload wurde abgebrochen.";
  if (code.includes("storage/retry-limit-exceeded")) return "Netzwerk- oder Serverproblem. Bitte später erneut versuchen.";
  return err?.message || "Upload fehlgeschlagen.";
};

export default function AvatarUploader({ uid, value, onChange }) {
  const { t } = useTranslation("profile");
  const [pct, setPct] = useState(null);
  const [busy, setBusy] = useState(false);

  const onPick = () => {
    if (busy) return;
    const el = document.createElement("input");
    el.type = "file";
    el.accept = "image/*";
    el.onchange = (e) => startUpload(e.target.files?.[0]);
    el.click();
  };

  // (Optional) lokaler Proxy für Storage im Dev – bleibt ungenutzt, nur als Notiz
  const patchStorageUploadURL = (url) => {
    if (process.env.NODE_ENV !== "development") return url;
    return url.replace("https://firebasestorage.googleapis.com", `${window.location.origin}/__fs__`);
  };

  const startUpload = async (file) => {
    try {
      if (!file || !uid || !auth.currentUser) return;
      await appCheckReady;

      const allowed = ["image/jpeg", "image/png", "image/webp"];
      if (!allowed.includes(file.type)) {
        toast.error(t("errors.onlyImages", "Bitte wählen Sie eine Bilddatei (JPG/PNG/WEBP)."));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(t("errors.imageTooLarge", "Das Bild ist größer als 5 MB."));
        return;
      }

      const safe = file.name.replace(/\s+/g, "_");
      const path = `users/${uid}/avatar/avatar_${Date.now()}_${safe}`;

      const task = uploadBytesResumable(ref(storage, path), file, {
        contentType: file.type,
        cacheControl: "public, max-age=3600",
      });

      setBusy(true);
      setPct(0);

      // —— WATCHDOG gegen „0 % hängt fest“ ——
      let lastBytes = 0;
      let stuckFor = 0;
      const watchdog = setInterval(() => {
        if (lastBytes === task.snapshot.bytesTransferred) {
          stuckFor += 1000;
          if (stuckFor >= 10000) {
            try { task.cancel(); } catch {}
            clearInterval(watchdog);
            setBusy(false);
            setPct(null);
            toast.error(
              "Upload blockiert (0 %). Bitte prüfen Sie Ihre Content-Security-Policy: " +
              "Erlauben Sie Verbindungen/Bilder zu securetoken.googleapis.com und firebasestorage.googleapis.com " +
              "sowie App Check (in der Entwicklung nicht erzwingen)."
            );
          }
        } else {
          lastBytes = task.snapshot.bytesTransferred;
          stuckFor = 0;
        }
      }, 1000);
      // ————————————————————————————————

      task.on(
        "state_changed",
        (snap) => {
          const p = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
          setPct(Number.isFinite(p) ? p : 0);
        },
        (err) => {
          clearInterval(watchdog);
          console.error("[avatar] upload error:", err);
          setBusy(false);
          setPct(null);
          toast.error(mapStorageError(err));
        },
        async () => {
          clearInterval(watchdog);
          try {
            const url = await getDownloadURL(task.snapshot.ref);
            try { await updateProfile(auth.currentUser, { photoURL: url }); } catch {}
            await setDoc(
              doc(db, "users", uid),
              { photoURL: url, updatedAt: new Date().toISOString() },
              { merge: true }
            );
            onChange?.(url);
            toast.success(t("photoUpdated", "Foto wurde aktualisiert."));
          } catch (e) {
            console.error(e);
            toast.error(t("errors.couldNotFetchUrl", "Die Bild-URL konnte nach dem Upload nicht abgerufen werden."));
          } finally {
            setBusy(false);
            setPct(null);
          }
        }
      );
    } catch (e) {
      console.error(e);
      setBusy(false);
      setPct(null);
      toast.error(e?.message || t("errors.uploadError", "Upload-Fehler."));
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="relative w-16 h-16 rounded-full overflow-hidden border border-gray-300 dark:border-gray-600">
        <img
          src={value || auth.currentUser?.photoURL || "https://via.placeholder.com/160x160?text=Avatar"}
          alt={t("avatar", "Avatar")}
          className="w-full h-full object-cover"
        />
        <button
          type="button"
          onClick={onPick}
          disabled={busy}
          className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 text-white text-xs transition flex items-center justify-center disabled:opacity-60"
          title={t("change", "Ändern")}
        >
          {busy ? t("uploading", "Wird hochgeladen…") : t("change", "Ändern")}
        </button>
      </div>

      <button
        type="button"
        onClick={onPick}
        disabled={busy}
        className="px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-60"
      >
        {busy ? `${pct ?? 0}%` : t("uploadPhoto", "Foto hochladen")}
      </button>
    </div>
  );
}
