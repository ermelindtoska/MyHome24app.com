// src/components/profile/AvatarUploader.jsx
import React, { useState } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage, appCheckReady } from "../../firebase";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

export default function AvatarUploader({ uid, value, onChange }) {
  const { t } = useTranslation("profile");
  const [pct, setPct] = useState(null);

  const onPick = () => {
    const el = document.createElement("input");
    el.type = "file";
    el.accept = "image/*";
    el.onchange = (e) => startUpload(e.target.files?.[0]);
    el.click();
  };

  const startUpload = async (file) => {
    try {
      if (!file || !uid) return;

      // 🔐 WICHTIG: warte, bis App Check initialisiert ist
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
      const path = `users/${uid}/avatar/${Date.now()}_${safe}`;

      const task = uploadBytesResumable(ref(storage, path), file, {
        contentType: file.type,
        cacheControl: "public, max-age=3600",
      });

      setPct(0);

      task.on(
        "state_changed",
        (snap) => setPct(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
        (err) => {
          setPct(null);
          toast.error(err?.message || t("errors.uploadFailed", "Upload failed."));
        },
        async () => {
          try {
            const url = await getDownloadURL(task.snapshot.ref);
            setPct(null);
            onChange?.(url);
            toast.success(t("photoUpdated", "Photo updated."));
          } catch {
            setPct(null);
            toast.error(t("errors.couldNotFetchUrl", "Could not fetch URL after upload."));
          }
        }
      );
    } catch (e) {
      setPct(null);
      toast.error(e?.message || t("errors.uploadError", "Upload error."));
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="relative w-16 h-16 rounded-full overflow-hidden border border-gray-300 dark:border-gray-600">
        <img
          src={value || "https://via.placeholder.com/160x160?text=Avatar"}
          alt={t("avatar", "Avatar")}
          className="w-full h-full object-cover"
        />
        <button
          type="button"
          onClick={onPick}
          className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 text-white text-xs transition flex items-center justify-center"
          title={t("change", "Change")}
        >
          {t("change", "Change")}
        </button>
      </div>

      <button
        type="button"
        onClick={onPick}
        className="px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white"
      >
        {t("uploadPhoto", "Upload photo")}
      </button>

      {pct !== null && <span className="text-sm text-gray-500">{pct}%</span>}
    </div>
  );
}
