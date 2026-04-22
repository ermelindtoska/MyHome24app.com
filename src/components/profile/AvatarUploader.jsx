import React, { useMemo, useState } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage, appCheckReady } from "../../firebase";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { auth, db } from "../../firebase";
import { updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { FiCamera, FiUploadCloud, FiCheckCircle } from "react-icons/fi";

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

  const avatarSrc = useMemo(() => {
    return (
      value ||
      auth.currentUser?.photoURL ||
      "/images/default-avatar.png"
    );
  }, [value]);

  const onPick = () => {
    if (busy) return;

    const el = document.createElement("input");
    el.type = "file";
    el.accept = "image/*";
    el.onchange = (e) => startUpload(e.target.files?.[0]);
    el.click();
  };

  // Optional dev helper, bleibt erhalten
  const patchStorageUploadURL = (url) => {
    if (process.env.NODE_ENV !== "development") return url;
    return url.replace(
      "https://firebasestorage.googleapis.com",
      `${window.location.origin}/__fs__`
    );
  };

  const startUpload = async (file) => {
    try {
      if (!file || !uid || !auth.currentUser) return;
      await appCheckReady;

      const allowed = ["image/jpeg", "image/png", "image/webp"];
      if (!allowed.includes(file.type)) {
        toast.error(
          t("errors.onlyImages", "Bitte wählen Sie eine Bilddatei (JPG/PNG/WEBP).")
        );
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error(
          t("errors.imageTooLarge", "Das Bild ist größer als 5 MB.")
        );
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

      let lastBytes = 0;
      let stuckFor = 0;

      const watchdog = setInterval(() => {
        if (lastBytes === task.snapshot.bytesTransferred) {
          stuckFor += 1000;
          if (stuckFor >= 10000) {
            try {
              task.cancel();
            } catch {}
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

            try {
              await updateProfile(auth.currentUser, { photoURL: url });
            } catch {}

            await setDoc(
              doc(db, "users", uid),
              { photoURL: url, updatedAt: new Date().toISOString() },
              { merge: true }
            );

            onChange?.(url);
            toast.success(
              t("photoUpdated", "Foto wurde aktualisiert.")
            );
          } catch (e) {
            console.error(e);
            toast.error(
              t(
                "errors.couldNotFetchUrl",
                "Die Bild-URL konnte nach dem Upload nicht abgerufen werden."
              )
            );
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
    <div className="rounded-[28px] border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        {/* Avatar Preview */}
        <div className="relative">
          <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-slate-100 shadow-md ring-1 ring-slate-200 dark:border-slate-900 dark:bg-slate-800 dark:ring-slate-700">
            <img
              src={avatarSrc}
              alt={t("avatar", "Avatar")}
              className="h-full w-full object-cover"
            />

            <button
              type="button"
              onClick={onPick}
              disabled={busy}
              className="absolute inset-0 flex items-center justify-center bg-black/45 text-white opacity-0 transition hover:opacity-100 disabled:opacity-70"
              title={t("change", "Ändern")}
            >
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
                <FiCamera />
                {busy
                  ? t("uploading", "Wird hochgeladen…")
                  : t("change", "Ändern")}
              </span>
            </button>
          </div>

          {busy && (
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-3 py-1 text-[11px] font-semibold text-white shadow">
              {pct ?? 0}%
            </div>
          )}
        </div>

        {/* Text / Actions */}
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {t("avatarSectionTitle", "Profilbild")}
          </h3>

          <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
            {t(
              "avatarSectionText",
              "Laden Sie ein professionelles Profilbild hoch, damit Ihr Profil vertrauenswürdiger und persönlicher wirkt."
            )}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onPick}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
              <FiUploadCloud />
              {busy
                ? `${pct ?? 0}%`
                : t("uploadPhoto", "Foto hochladen")}
            </button>

            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
              <FiCheckCircle className="text-emerald-500" />
              JPG, PNG, WEBP · max. 5 MB
            </div>
          </div>

          {/* Progress bar */}
          {busy && (
            <div className="mt-4">
              <div className="mb-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>{t("uploading", "Wird hochgeladen…")}</span>
                <span>{pct ?? 0}%</span>
              </div>

              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${pct ?? 0}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}