// src/components/profile/AvatarUploader.jsx
import React, { useState } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage, appCheckReady } from "../../firebase";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { auth, db } from "../../firebase";
import { updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

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
  // zëvendëson hostin e Storage me proxy-n lokal në dev:
const patchStorageUploadURL = (url) => {
  if (process.env.NODE_ENV !== 'development') return url;
  // Storage SDK thërret firebasestorage.googleapis.com; e rutelezojmë te /__fs__
  return url.replace('https://firebasestorage.googleapis.com', `${window.location.origin}/__fs__`);
};


  const startUpload = async (file) => {
    try {
      if (!file || !uid || !auth.currentUser) return;
      await appCheckReady;

      const allowed = ["image/jpeg", "image/png", "image/webp"];
      if (!allowed.includes(file.type)) {
        toast.error(t("errors.onlyImages", "Only JPG/PNG/WEBP are allowed."));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(t("errors.imageTooLarge", "Image is larger than 5 MB."));
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

      task.on(
        "state_changed",
        (snap) => setPct(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
        (err) => {
          console.error("[avatar] upload error:", err);
          setBusy(false);
          setPct(null);
          toast.error(err?.message || t("errors.uploadFailed", "Upload failed."));
        },
        async () => {
          try {
            const url = await getDownloadURL(task.snapshot.ref);
            try { await updateProfile(auth.currentUser, { photoURL: url }); } catch {}
            await setDoc(doc(db, "users", uid), { photoURL: url, updatedAt: new Date().toISOString() }, { merge: true });
            onChange?.(url);
            toast.success(t("photoUpdated", "Photo updated."));
          } catch (e) {
            console.error(e);
            toast.error(t("errors.couldNotFetchUrl", "Could not fetch URL after upload."));
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
      toast.error(e?.message || t("errors.uploadError", "Upload error."));
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
          title={t("change", "Change")}
        >
          {busy ? t("uploading", "Uploading…") : t("change", "Change")}
        </button>
      </div>

      <button
        type="button"
        onClick={onPick}
        disabled={busy}
        className="px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-60"
      >
        {busy ? `${pct ?? 0}%` : t("uploadPhoto", "Upload photo")}
      </button>
    </div>
  );
}
